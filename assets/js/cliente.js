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
                el('td', { text: agendamento.servicos ? agendamento.servicos.nome : '-' }),
                el('td', { text: agendamento.barbeiros ? agendamento.barbeiros.nome : '-' }),
                el('td', { text: App.formatarData(agendamento.data) }),
                el('td', { text: App.formatarHora(agendamento.horario) }),
                el('td', {}, el('span', { class: `status-badge ${classeStatus[agendamento.status]}`, text: agendamento.status })),
                el('td', {}, podeCancelar
                    ? el('button', {
                        type: 'button',
                        class: 'btn btn-danger btn-small',
                        text: 'Cancelar',
                        onclick: () => cancelar(agendamento.id)
                    })
                    : el('span', { class: 'muted-text', text: '—' }))
            );
        }));
    }

    async function cancelar(id) {
        if (!window.confirm('Deseja realmente cancelar este agendamento?')) return;
        const { error } = await db.rpc('cancelar_agendamento', { p_id: id });
        if (error) {
            App.mensagem('status', App.traduzirErro(error), 'erro');
            return;
        }
        App.mensagem('status', 'Agendamento cancelado.');
        carregar();
    }

    carregar();
});
