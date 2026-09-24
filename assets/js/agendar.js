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

    // Funcionamento: segunda a sábado, das 09:00 às 19:00, horários a cada 30 minutos
    const ABERTURA = 9 * 60;
    const FECHAMENTO = 19 * 60;
    const paraHora = minutos => `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    let duracaoPorServico = {};
    let consultaAtual = 0;

    dataInput.min = App.hojeISO();
    // Começa no próximo dia aberto (pula domingo)
    const inicial = new Date();
    if (inicial.getDay() === 0) inicial.setDate(inicial.getDate() + 1);
    dataInput.value = `${inicial.getFullYear()}-${String(inicial.getMonth() + 1).padStart(2, '0')}-${String(inicial.getDate()).padStart(2, '0')}`;

    const [servicos, barbeiros] = await Promise.all([
        db.from('servicos').select('*').order('id'),
        db.from('barbeiros').select('*').order('id')
    ]);

    if (servicos.error || barbeiros.error) {
        App.mensagem('status', 'Não foi possível carregar serviços e barbeiros.', 'erro');
        return;
    }

    servicos.data.forEach(servico => {
        duracaoPorServico[servico.id] = servico.duracao;
        servicoSelect.append(
            el('option', { value: servico.id, text: `${servico.nome} - ${App.formatarValor(servico.valor)} (${servico.duracao} min)` })
        );
    });
    barbeiros.data.forEach(barbeiro => barbeiroSelect.append(
        el('option', { value: barbeiro.id, text: `${barbeiro.nome} - ${barbeiro.especialidade}` })
    ));

    const semHorario = texto => horarioSelect.replaceChildren(el('option', { value: '', text: texto }));

    async function carregarHorarios() {
        const escolhaAnterior = horarioSelect.value;
        semHorario('Selecione um horário');
        const caixa = document.getElementById('status');
        if (caixa && caixa.classList.contains('notice-error')) caixa.hidden = true;

        if (!barbeiroSelect.value || !dataInput.value) return;

        const data = dataInput.value;
        if (data < App.hojeISO()) {
            semHorario('Data já passou');
            App.mensagem('status', 'Escolha uma data a partir de hoje.', 'erro');
            return;
        }
        // getDay() com horário do meio-dia evita erro de fuso: 0 = domingo
        if (new Date(`${data}T12:00:00`).getDay() === 0) {
            semHorario('Fechado aos domingos');
            App.mensagem('status', 'A barbearia não abre aos domingos. Escolha outro dia.', 'erro');
            return;
        }

        // Se o usuário trocar de barbeiro/data rápido, só a última consulta vale
        const minhaConsulta = ++consultaAtual;
        semHorario('Carregando horários...');
        horarioSelect.disabled = true;

        let resposta;
        try {
            resposta = await App.comLimiteDeTempo(db.rpc('horarios_ocupados', {
                p_barbeiro_id: Number(barbeiroSelect.value),
                p_data: data
            }));
        } catch (erro) {
            resposta = { error: erro };
        }
        if (minhaConsulta !== consultaAtual) return;
        horarioSelect.disabled = false;

        if (resposta.error) {
            semHorario('Selecione um horário');
            App.mensagem('status', 'Não foi possível consultar a disponibilidade.', 'erro');
            return;
        }

        const ocupados = new Set(resposta.data.map(App.formatarHora));
        // O serviço precisa terminar até o fechamento
        const duracao = duracaoPorServico[servicoSelect.value] || 30;
        const agora = new Date();
        const minutosAgora = data === App.hojeISO() ? agora.getHours() * 60 + agora.getMinutes() : -1;

        const livres = [];
        for (let m = ABERTURA; m + duracao <= FECHAMENTO; m += 30) {
            const hora = paraHora(m);
            if (!ocupados.has(hora) && m > minutosAgora) livres.push(hora);
        }

        if (!livres.length) {
            semHorario('Sem horários disponíveis');
            return;
        }
        semHorario('Selecione um horário');
        livres.forEach(h => horarioSelect.append(el('option', { value: h, text: h })));
        if (livres.includes(escolhaAnterior)) horarioSelect.value = escolhaAnterior;
    }

    servicoSelect.addEventListener('change', carregarHorarios);
    barbeiroSelect.addEventListener('change', carregarHorarios);
    dataInput.addEventListener('change', carregarHorarios);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!servicoSelect.value || !barbeiroSelect.value || !dataInput.value || !horarioSelect.value) {
            App.mensagem('status', 'Preencha todos os campos antes de confirmar.', 'erro');
            return;
        }

        const botao = form.querySelector('button[type="submit"]');
        if (botao.disabled) return;
        App.carregando(botao, true, 'Agendando...');

        try {
            const { error } = await App.comLimiteDeTempo(db.from('agendamentos').insert({
                usuario_id: perfil.id,
                servico_id: Number(servicoSelect.value),
                barbeiro_id: Number(barbeiroSelect.value),
                data: dataInput.value,
                horario: horarioSelect.value
            }));

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                App.carregando(botao, false);
                carregarHorarios();
                return;
            }

            App.mensagem('status', 'Agendamento realizado com sucesso!');
            setTimeout(() => { window.location.href = 'cliente.html'; }, 1200);
        } catch (erro) {
            App.mensagem('status', App.traduzirErro(erro), 'erro');
            App.carregando(botao, false);
        }
    });
});
