// Tela de agendamento: escolhe serviço, barbeiro, data e horário livre.
document.addEventListener('DOMContentLoaded', async function () {
    const { db, el } = App;
    if (!db) return;

    const perfil = await App.exigirLogin();
    if (!perfil) return;
    document.getElementById('nomeUsuario').textContent = perfil.nome;

    const servicoSelect = document.getElementById('servico');
    const barbeiroSelect = document.getElementById('barbeiro');
    const dataInput = document.getElementById('data');
    const horarioSelect = document.getElementById('horario');
    const form = document.getElementById('agendarForm');

    // Horários de atendimento: 09:00 às 19:00, a cada 30 minutos
    const todosHorarios = [];
    for (let minutos = 9 * 60; minutos <= 19 * 60; minutos += 30) {
        todosHorarios.push(`${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`);
    }

    dataInput.min = App.hojeISO();
    dataInput.value = App.hojeISO();

    const [servicos, barbeiros] = await Promise.all([
        db.from('servicos').select('*').order('id'),
        db.from('barbeiros').select('*').order('id')
    ]);

    if (servicos.error || barbeiros.error) {
        App.mensagem('status', 'Não foi possível carregar serviços e barbeiros.', 'erro');
        return;
    }

    servicos.data.forEach(servico => servicoSelect.append(
        el('option', { value: servico.id, text: `${servico.nome} - ${App.formatarValor(servico.valor)}` })
    ));
    barbeiros.data.forEach(barbeiro => barbeiroSelect.append(
        el('option', { value: barbeiro.id, text: `${barbeiro.nome} - ${barbeiro.especialidade}` })
    ));

    async function carregarHorarios() {
        horarioSelect.replaceChildren(el('option', { value: '', text: 'Selecione um horário' }));
        if (!barbeiroSelect.value || !dataInput.value) return;

        const { data: ocupados, error } = await db.rpc('horarios_ocupados', {
            p_barbeiro_id: Number(barbeiroSelect.value),
            p_data: dataInput.value
        });
        if (error) {
            App.mensagem('status', 'Não foi possível consultar a disponibilidade.', 'erro');
            return;
        }

        const ocupadosSet = new Set(ocupados.map(App.formatarHora));
        const agora = new Date();
        const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        const ehHoje = dataInput.value === App.hojeISO();

        const livres = todosHorarios.filter(h => !ocupadosSet.has(h) && (!ehHoje || h > horaAtual));
        if (!livres.length) {
            horarioSelect.replaceChildren(el('option', { value: '', text: 'Sem horários disponíveis' }));
            return;
        }
        livres.forEach(h => horarioSelect.append(el('option', { value: h, text: h })));
    }

    barbeiroSelect.addEventListener('change', carregarHorarios);
    dataInput.addEventListener('change', carregarHorarios);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!servicoSelect.value || !barbeiroSelect.value || !dataInput.value || !horarioSelect.value) {
            App.mensagem('status', 'Preencha todos os campos antes de confirmar.', 'erro');
            return;
        }

        const { error } = await db.from('agendamentos').insert({
            usuario_id: perfil.id,
            servico_id: Number(servicoSelect.value),
            barbeiro_id: Number(barbeiroSelect.value),
            data: dataInput.value,
            horario: horarioSelect.value
        });

        if (error) {
            App.mensagem('status', App.traduzirErro(error), 'erro');
            carregarHorarios();
            return;
        }

        App.mensagem('status', 'Agendamento realizado com sucesso!');
        setTimeout(() => { window.location.href = 'cliente.html'; }, 1200);
    });
});
