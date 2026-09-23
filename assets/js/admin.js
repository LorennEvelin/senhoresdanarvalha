// Painel administrativo: agendamentos de todos os clientes, serviços e barbeiros.
document.addEventListener('DOMContentLoaded', async function () {
    const { db, el } = App;
    if (!db) return;

    const perfil = await App.exigirLogin('ADMIN');
    if (!perfil) return;

    const status = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'];

    // ---------- Agendamentos ----------
    async function carregarAgendamentos() {
        const { data, error } = await db
            .from('agendamentos')
            .select('id, data, horario, status, perfis(nome, telefone), servicos(nome), barbeiros(nome)')
            .order('data', { ascending: false })
            .order('horario', { ascending: false });

        const corpo = document.getElementById('tabelaAgendamentos');
        if (error) {
            App.mensagem('status', 'Não foi possível carregar os agendamentos.', 'erro');
            return;
        }

        const hoje = App.hojeISO();
        document.getElementById('totalHoje').textContent =
            data.filter(a => a.data === hoje && a.status !== 'CANCELADO').length;
        document.getElementById('totalPendentes').textContent =
            data.filter(a => a.status === 'PENDENTE').length;

        if (!data.length) {
            corpo.replaceChildren(el('tr', {}, el('td', { colspan: '6', class: 'muted-text', text: 'Nenhum agendamento ainda.' })));
            return;
        }

        corpo.replaceChildren(...data.map(agendamento => {
            const seletor = el('select', {
                'aria-label': 'Status do agendamento',
                onchange: async event => {
                    const { error: erro } = await db.from('agendamentos')
                        .update({ status: event.target.value })
                        .eq('id', agendamento.id);
                    if (erro) App.mensagem('status', App.traduzirErro(erro), 'erro');
                    carregarAgendamentos();
                }
            }, status.map(s => el('option', { value: s, text: s })));
            seletor.value = agendamento.status;

            return el('tr', {},
                el('td', { 'data-label': 'Cliente' },
                    el('div', {},
                        agendamento.perfis ? agendamento.perfis.nome : '-',
                        el('small', { class: 'muted-text block', text: agendamento.perfis ? agendamento.perfis.telefone : '' })
                    )
                ),
                el('td', { 'data-label': 'Serviço', text: agendamento.servicos ? agendamento.servicos.nome : '-' }),
                el('td', { 'data-label': 'Barbeiro', text: agendamento.barbeiros ? agendamento.barbeiros.nome : '-' }),
                el('td', { 'data-label': 'Data', text: App.formatarData(agendamento.data) }),
                el('td', { 'data-label': 'Hora', text: App.formatarHora(agendamento.horario) }),
                el('td', { 'data-label': 'Status' }, seletor)
            );
        }));
    }

    // ---------- Serviços ----------
    const modal = document.getElementById('modalServico');
    const formServico = document.getElementById('servicoForm');

    function abrirModal(servico) {
        document.getElementById('modalTitulo').textContent = servico ? 'Editar serviço' : 'Novo serviço';
        document.getElementById('servicoId').value = servico ? servico.id : '';
        document.getElementById('servicoNome').value = servico ? servico.nome : '';
        document.getElementById('servicoDescricao').value = servico ? servico.descricao : '';
        document.getElementById('servicoValor').value = servico ? servico.valor : '';
        document.getElementById('servicoDuracao').value = servico ? servico.duracao : 30;
        modal.hidden = false;
    }

    document.getElementById('fecharModal').addEventListener('click', () => { modal.hidden = true; });
    document.getElementById('novoServico').addEventListener('click', () => abrirModal(null));

    formServico.addEventListener('submit', async function (event) {
        event.preventDefault();
        const id = document.getElementById('servicoId').value;
        const dados = {
            nome: document.getElementById('servicoNome').value.trim(),
            descricao: document.getElementById('servicoDescricao').value.trim(),
            valor: Number(document.getElementById('servicoValor').value),
            duracao: Number(document.getElementById('servicoDuracao').value)
        };

        const { error } = id
            ? await db.from('servicos').update(dados).eq('id', id)
            : await db.from('servicos').insert(dados);

        if (error) {
            alert(App.traduzirErro(error));
            return;
        }
        modal.hidden = true;
        carregarServicos();
    });

    async function carregarServicos() {
        const { data, error } = await db.from('servicos').select('*').order('id');
        const lista = document.getElementById('listaServicosAdmin');
        if (error) return;

        document.getElementById('totalServicos').textContent = data.length;
        lista.replaceChildren(...data.map(servico =>
            el('li', {},
                el('div', {},
                    el('strong', { text: servico.nome }),
                    el('small', { text: `${App.formatarValor(servico.valor)} · ${servico.duracao} min` })
                ),
                el('button', { type: 'button', class: 'btn btn-outline btn-small', text: 'Editar', onclick: () => abrirModal(servico) })
            )
        ));
    }

    // ---------- Barbeiros ----------
    async function carregarBarbeiros() {
        const { data, error } = await db.from('barbeiros').select('*').order('id');
        const lista = document.getElementById('listaBarbeirosAdmin');
        if (error) return;

        lista.replaceChildren(...data.map(barbeiro =>
            el('li', {},
                el('div', {},
                    el('strong', { text: barbeiro.nome }),
                    el('small', { text: barbeiro.especialidade })
                )
            )
        ));
    }

    document.getElementById('barbeiroForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const nome = document.getElementById('barbeiroNome');
        const especialidade = document.getElementById('barbeiroEspecialidade');
        const { error } = await db.from('barbeiros').insert({
            nome: nome.value.trim(),
            especialidade: especialidade.value.trim()
        });
        if (error) {
            App.mensagem('status', App.traduzirErro(error), 'erro');
            return;
        }
        event.target.reset();
        carregarBarbeiros();
    });

    carregarAgendamentos();
    carregarServicos();
    carregarBarbeiros();
});
