// Código compartilhado por todas as páginas: conexão com o Supabase, menu, sessão e utilitários.
(function () {
    const config = window.SUPABASE_CONFIG || {};
    const configurado = config.url && config.url.startsWith('https://') && config.anonKey && !config.anonKey.startsWith('COLE_');

    const db = configurado ? window.supabase.createClient(config.url, config.anonKey) : null;

    const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const App = {
        db,
        configurado,

        formatarValor(valor) {
            return moeda.format(Number(valor));
        },

        // "2026-09-24" → "24/09/2026"
        formatarData(data) {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        },

        // "10:00:00" → "10:00"
        formatarHora(hora) {
            return hora.slice(0, 5);
        },

        hojeISO() {
            const hoje = new Date();
            const mm = String(hoje.getMonth() + 1).padStart(2, '0');
            const dd = String(hoje.getDate()).padStart(2, '0');
            return `${hoje.getFullYear()}-${mm}-${dd}`;
        },

        // Cria elementos sem usar innerHTML com dados do banco (evita injeção de HTML)
        el(tag, props = {}, ...filhos) {
            const elemento = document.createElement(tag);
            Object.entries(props).forEach(([chave, valor]) => {
                if (chave === 'class') elemento.className = valor;
                else if (chave === 'text') elemento.textContent = valor;
                else if (chave.startsWith('on')) elemento.addEventListener(chave.slice(2), valor);
                else elemento.setAttribute(chave, valor);
            });
            filhos.flat().forEach(filho => {
                if (filho == null) return;
                elemento.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
            });
            return elemento;
        },

        mensagem(alvo, texto, tipo = 'sucesso') {
            const caixa = typeof alvo === 'string' ? document.getElementById(alvo) : alvo;
            if (!caixa) return alert(texto);
            caixa.textContent = texto;
            caixa.className = `notice ${tipo === 'erro' ? 'notice-error' : 'notice-success'}`;
            caixa.hidden = false;
        },

        // Traduz as mensagens de erro mais comuns do Supabase
        traduzirErro(erro) {
            const texto = (erro && (erro.message || erro.error_description)) || String(erro || '');
            if (/Invalid login credentials/i.test(texto)) return 'E-mail ou senha inválidos.';
            if (/Email not confirmed/i.test(texto)) return 'Confirme seu e-mail antes de entrar (verifique a caixa de entrada).';
            if (/User already registered/i.test(texto)) return 'Este e-mail já está cadastrado.';
            if (/Password should be at least/i.test(texto)) return 'A senha deve ter pelo menos 6 caracteres.';
            if (/duplicate key|agendamentos_horario_unico/i.test(texto)) return 'Este horário acabou de ser ocupado. Escolha outro.';
            if (/rate limit/i.test(texto)) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
            if (/Failed to fetch|NetworkError|Load failed/i.test(texto)) return 'Não foi possível conectar ao servidor. Verifique sua internet.';
            return texto || 'Algo deu errado. Tente novamente.';
        },

        async sessao() {
            if (!db) return null;
            const { data } = await db.auth.getSession();
            return data.session;
        },

        // O perfil fica guardado na aba para não buscar no banco a cada página.
        // É só para a tela: quem garante o acesso são as regras (RLS) do banco.
        async perfil() {
            const sessao = await App.sessao();
            if (!sessao) {
                App.limparPerfil();
                return null;
            }

            const chave = `perfil:${sessao.user.id}`;
            try {
                const guardado = sessionStorage.getItem(chave);
                if (guardado) return JSON.parse(guardado);
            } catch (e) { /* armazenamento bloqueado: segue buscando no banco */ }

            const { data, error } = await db.from('perfis').select('*').eq('id', sessao.user.id).single();
            if (error) return null;
            try { sessionStorage.setItem(chave, JSON.stringify(data)); } catch (e) { /* ignora */ }
            return data;
        },

        limparPerfil() {
            try {
                Object.keys(sessionStorage).filter(k => k.startsWith('perfil:')).forEach(k => sessionStorage.removeItem(k));
            } catch (e) { /* ignora */ }
        },

        // Trava o botão enquanto espera o servidor, mostrando o que está acontecendo
        carregando(botao, ativo, textoCarregando = 'Aguarde...') {
            if (!botao) return;
            if (ativo) {
                if (!botao.dataset.textoOriginal) botao.dataset.textoOriginal = botao.textContent;
                botao.textContent = textoCarregando;
                botao.disabled = true;
                botao.setAttribute('aria-busy', 'true');
            } else {
                if (botao.dataset.textoOriginal) botao.textContent = botao.dataset.textoOriginal;
                botao.disabled = false;
                botao.removeAttribute('aria-busy');
            }
        },

        // Evita que um pedido ao servidor fique esperando para sempre (ex.: internet caiu)
        comLimiteDeTempo(promessa, ms = 20000) {
            return Promise.race([
                promessa,
                new Promise((_, rejeitar) => setTimeout(() => rejeitar(new Error('Tempo esgotado. Verifique sua internet e tente novamente.')), ms))
            ]);
        },

        // Protege páginas: sem login → vai para o login; admin/cliente no lugar errado → redireciona
        async exigirLogin(tipoNecessario) {
            if (!db) return null;
            const perfil = await App.perfil();
            if (!perfil) {
                const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
                window.location.href = `login.html?voltar=${encodeURIComponent(paginaAtual)}`;
                return null;
            }
            if (tipoNecessario === 'ADMIN' && perfil.tipo !== 'ADMIN') {
                window.location.href = 'cliente.html';
                return null;
            }
            return perfil;
        },

        async sair() {
            App.limparPerfil();
            if (db) await db.auth.signOut().catch(() => {});
            window.location.href = 'index.html';
        }
    };

    window.App = App;

    document.addEventListener('DOMContentLoaded', async function () {
        // Menu do celular
        const botaoMenu = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');
        if (botaoMenu && menu) {
            const definirMenu = aberto => {
                menu.classList.toggle('open', aberto);
                botaoMenu.setAttribute('aria-expanded', String(aberto));
                botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
                botaoMenu.textContent = aberto ? '✕' : '☰';
            };

            botaoMenu.addEventListener('click', event => {
                event.stopPropagation();
                definirMenu(!menu.classList.contains('open'));
            });
            // Fecha ao escolher um link ou tocar fora do menu
            menu.addEventListener('click', event => {
                if (event.target.closest('a')) definirMenu(false);
            });
            document.addEventListener('click', event => {
                if (menu.classList.contains('open') && !menu.contains(event.target)) definirMenu(false);
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') definirMenu(false);
            });
        }

        // Links "Sair"
        document.querySelectorAll('[data-sair]').forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                App.sair();
            });
        });

        // Aviso quando o config.js ainda não foi preenchido
        if (!configurado) {
            const aviso = App.el('div', { class: 'config-warning', text: 'Supabase não configurado: preencha assets/js/config.js com a URL e a chave do projeto.' });
            document.body.prepend(aviso);
            return;
        }

        // Nas páginas públicas, troca "Entrar" por "Minha conta" quando já está logado
        const acoes = document.querySelector('[data-acoes-publicas]');
        if (acoes) {
            const perfil = await App.perfil();
            if (perfil) {
                const destino = perfil.tipo === 'ADMIN' ? 'admin.html' : 'cliente.html';
                acoes.replaceChildren(
                    App.el('a', { class: 'btn btn-outline', href: destino, text: 'Minha conta' }),
                    App.el('a', { class: 'btn btn-primary', href: 'agendar.html', text: 'Agendar' })
                );
            }
        }
    });
})();
