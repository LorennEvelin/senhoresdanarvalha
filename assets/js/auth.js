// Login, cadastro, recuperação e redefinição de senha.
document.addEventListener('DOMContentLoaded', function () {
    const { db } = App;
    if (!db) return;

    const urlDaPagina = pagina => new URL(pagina, window.location.href).href;

    function travarBotao(form, travado) {
        const botao = form.querySelector('button[type="submit"]');
        if (!botao) return;
        botao.disabled = travado;
        botao.style.opacity = travado ? '0.6' : '';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            travarBotao(loginForm, true);

            const { error } = await db.auth.signInWithPassword({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('senha').value
            });

            if (error) {
                travarBotao(loginForm, false);
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return;
            }

            // Volta para a página que pediu login (só páginas deste site, nada de links externos)
            const voltar = new URLSearchParams(window.location.search).get('voltar');
            if (voltar && /^[a-z-]+\.html$/.test(voltar) && voltar !== 'login.html') {
                window.location.href = voltar;
                return;
            }

            const perfil = await App.perfil();
            window.location.href = perfil && perfil.tipo === 'ADMIN' ? 'admin.html' : 'cliente.html';
        });
    }

    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const senha = document.getElementById('senha').value;
            if (senha.length < 6) {
                App.mensagem('status', 'A senha deve ter pelo menos 6 caracteres.', 'erro');
                return;
            }

            travarBotao(cadastroForm, true);
            const { data, error } = await db.auth.signUp({
                email: document.getElementById('email').value.trim(),
                password: senha,
                options: {
                    data: {
                        nome: document.getElementById('nome').value.trim(),
                        telefone: document.getElementById('telefone').value.trim()
                    },
                    emailRedirectTo: urlDaPagina('login.html')
                }
            });
            travarBotao(cadastroForm, false);

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return;
            }

            // Com confirmação de e-mail ligada no Supabase, a sessão só existe depois da confirmação
            if (!data.session) {
                cadastroForm.reset();
                App.mensagem('status', 'Cadastro feito! Enviamos um link de confirmação para o seu e-mail.');
                return;
            }

            window.location.href = 'cliente.html';
        });
    }

    const esqueciForm = document.getElementById('esqueciForm');
    if (esqueciForm) {
        esqueciForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            travarBotao(esqueciForm, true);

            const { error } = await db.auth.resetPasswordForEmail(
                document.getElementById('email').value.trim(),
                { redirectTo: urlDaPagina('nova-senha.html') }
            );
            travarBotao(esqueciForm, false);

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return;
            }
            // Mesma mensagem exista ou não o e-mail, para não revelar quem tem conta
            App.mensagem('status', 'Se este e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.');
        });
    }

    const novaSenhaForm = document.getElementById('novaSenhaForm');
    if (novaSenhaForm) {
        // O link do e-mail abre esta página já com uma sessão temporária de recuperação
        App.sessao().then(sessao => {
            if (!sessao) {
                novaSenhaForm.hidden = true;
                App.mensagem('status', 'Link inválido ou expirado. Solicite uma nova recuperação de senha.', 'erro');
            }
        });

        novaSenhaForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const senha = document.getElementById('novaSenha').value;
            if (senha.length < 6) {
                App.mensagem('status', 'A senha deve ter pelo menos 6 caracteres.', 'erro');
                return;
            }

            travarBotao(novaSenhaForm, true);
            const { error } = await db.auth.updateUser({ password: senha });
            travarBotao(novaSenhaForm, false);

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return;
            }

            await db.auth.signOut();
            novaSenhaForm.hidden = true;
            App.mensagem('status', 'Senha alterada com sucesso! Você já pode entrar com a nova senha.');
        });
    }
});
