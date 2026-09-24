// Painel do cliente: próximos agendamentos e histórico com cancelamento.
document.addEventListener('DOMContentLoaded', async function () {
    const { db, el } = App;
    if (!db) return;

    const perfil = await App.exigirLogin();
    if (!perfil) return;
    document.getElementById('nomeUsuario').textContent = perfil.nome;

    const corpoTabela = document.getElementById('historico');
    const contador = document.getElementById('proximos');

    const classeStatus = {
        PENDENTE: 'pending',
        CONFIRMADO: 'confirmed',
        CONCLUIDO: 'concluded',
        CANCELADO: 'cancelled'
    };

    async function carregar() {
        const { data, error } = await db
            .from('agendamentos')
            .select('id, data, horario, status, servicos(nome), barbeiros(nome)')
            .eq('usuario_id', perfil.id)
            .order('data', { ascending: false })
            .order('horario', { ascending: false });

        if (error) {
            App.mensagem('status', 'Não foi possível carregar seus agendamentos.', 'erro');
            return;
        }

        const agora = new Date();
        contador.textContent = data.filter(a =>
            (a.status === 'PENDENTE' || a.status === 'CONFIRMADO') && new Date(`${a.data}T${a.horario}`) > agora
        ).length;

        if (!data.length) {
            corpoTabela.replaceChildren(el('tr', {}, el('td', { colspan: '6', class: 'muted-text', text: 'Nenhum agendamento encontrado.' })));
            return;
        }

        corpoTabela.replaceChildren(...data.map(agendamento => {
            const podeCancelar = agendamento.status === 'PENDENTE' || agendamento.status === 'CONFIRMADO';
            return el('tr', {},
                el('td', { 'data-label': 'Serviço', text: agendamento.servicos ? agendamento.servicos.nome : '-' }),
                el('td', { 'data-label': 'Barbeiro', text: agendamento.barbeiros ? agendamento.barbeiros.nome : '-' }),
                el('td', { 'data-label': 'Data', text: App.formatarData(agendamento.data) }),
                el('td', { 'data-label': 'Hora', text: App.formatarHora(agendamento.horario) }),
                el('td', { 'data-label': 'Status' }, el('span', { class: `status-badge ${classeStatus[agendamento.status]}`, text: agendamento.status })),
                el('td', { 'data-label': 'Ações' }, podeCancelar
                    ? el('button', {
                        type: 'button',
                        class: 'btn btn-danger btn-small',
                        text: 'Cancelar',
                        onclick: event => cancelar(agendamento.id, event.currentTarget)
                    })
                    : el('span', { class: 'muted-text', text: '—' }))
            );
        }));
    }

    async function cancelar(id, botao) {
        if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
        App.carregando(botao, true, 'Cancelando...');
        try {
            const { error } = await App.comLimiteDeTempo(db.rpc('cancelar_agendamento', { p_id: id }));
            if (error) throw error;
            App.mensagem('status', 'Agendamento cancelado.');
            carregar();
        } catch (erro) {
            App.mensagem('status', App.traduzirErro(erro), 'erro');
            App.carregando(botao, false);
        }
    }

    carregar();
});
