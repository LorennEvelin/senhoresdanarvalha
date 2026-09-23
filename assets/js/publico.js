// Preenche serviços, preços e equipe nas páginas públicas a partir do banco.
document.addEventListener('DOMContentLoaded', async function () {
    const { db, el } = App;
    if (!db) return;

    const fotos = [
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80'
    ];
    const icones = ['✂️', '🪒', '💇', '🧴', '🎨'];

    const precos = document.getElementById('listaPrecos');
    const servicos = document.getElementById('listaServicos');
    const vitrine = document.getElementById('vitrineBarbeiros');
    const equipe = document.getElementById('listaEquipe');

    if (precos || servicos) {
        const { data, error } = await db.from('servicos').select('*').order('id');
        if (error) {
            (precos || servicos).replaceChildren(el('p', { class: 'muted-text', text: 'Não foi possível carregar os serviços.' }));
        } else {
            if (precos) {
                precos.replaceChildren(...data.map((servico, i) =>
                    el('article', { class: i === 1 ? 'price-card featured' : 'price-card' },
                        i === 0 ? el('span', { class: 'tag', text: 'Mais pedido' }) : null,
                        i === 1 ? el('span', { class: 'tag', text: 'Recomendado' }) : null,
                        el('h3', { text: servico.nome }),
                        el('div', { class: 'price', text: App.formatarValor(servico.valor) }),
                        el('ul', {},
                            el('li', { text: servico.descricao }),
                            el('li', { text: `Duração: ${servico.duracao} min` })
                        ),
                        el('a', { href: 'agendar.html', class: 'btn btn-primary full', text: 'Agendar' })
                    )
                ));
            }
            if (servicos) {
                servicos.replaceChildren(...data.map((servico, i) =>
                    el('article', { class: 'service-highlight' },
                        el('span', { class: 'icon', text: icones[i % icones.length] }),
                        el('h3', { text: servico.nome }),
                        el('p', { text: servico.descricao }),
                        el('p', {},
                            el('strong', { text: App.formatarValor(servico.valor) }),
                            ` · ${servico.duracao} min`
                        )
                    )
                ));
            }
        }
    }

    if (vitrine || equipe) {
        const { data, error } = await db.from('barbeiros').select('*').order('id');
        if (error) {
            (vitrine || equipe).replaceChildren(el('p', { class: 'muted-text', text: 'Não foi possível carregar a equipe.' }));
        } else {
            if (vitrine) {
                vitrine.replaceChildren(...data.map((barbeiro, i) =>
                    el('article', { class: 'barber-card' },
                        el('img', { src: fotos[i % fotos.length], alt: `Barbeiro ${barbeiro.nome}`, loading: 'lazy' }),
                        el('div', { class: 'barber-info' },
                            el('h3', { text: barbeiro.nome }),
                            el('p', { text: barbeiro.especialidade })
                        )
                    )
                ));
            }
            if (equipe) {
                equipe.replaceChildren(...data.map((barbeiro, i) =>
                    el('article', { class: 'team-card' },
                        el('img', { class: 'team-photo', src: fotos[i % fotos.length], alt: `Barbeiro ${barbeiro.nome}`, loading: 'lazy' }),
                        el('div', { class: 'avatar', text: barbeiro.nome.charAt(0) }),
                        el('h3', { text: barbeiro.nome }),
                        el('p', { text: barbeiro.especialidade })
                    )
                ));
            }
        }
    }
});
