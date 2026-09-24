// Login, cadastro, recuperação e redefinição de senha.
document.addEventListener('DOMContentLoaded', function () {
    const { db } = App;
    if (!db) return;

    const urlDaPagina = pagina => new URL(pagina, window.location.href).href;
    const botaoDe = form => form.querySelector('button[type="submit"]');
    const esconderMensagem = () => {
        const caixa = document.getElementById('status');
        if (caixa) caixa.hidden = true;
    };

    // Liga um formulário: trava o botão durante o envio e SEMPRE destrava no fim,
    // mesmo se der erro ou a internet cair. Evita também envio duplo.
    function ligarFormulario(form, textoCarregando, enviar) {
        let enviando = false;

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (enviando) return;
            enviando = true;
            esconderMensagem();
            App.carregando(botaoDe(form), true, textoCarregando);

            let manterTravado = false;
            try {
                manterTravado = await enviar();
            } catch (erro) {
                App.mensagem('status', App.traduzirErro(erro), 'erro');
            } finally {
                enviando = false;
                if (!manterTravado) App.carregando(botaoDe(form), false);
            }
        });

        // Ao editar qualquer campo, some a mensagem de erro antiga
        form.addEventListener('input', () => {
            const caixa = document.getElementById('status');
            if (caixa && caixa.classList.contains('notice-error')) caixa.hidden = true;
        });
    }

    // Ao voltar para a página pelo botão "Voltar" do navegador, o botão não pode ficar travado
    window.addEventListener('pageshow', () => {
        document.querySelectorAll('form button[type="submit"]').forEach(b => App.carregando(b, false));
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        ligarFormulario(loginForm, 'Entrando...', async () => {
            App.limparPerfil();
            const { error } = await App.comLimiteDeTempo(db.auth.signInWithPassword({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('senha').value
            }));

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return false;
            }

            // Volta para a página que pediu login (só páginas deste site, nada de links externos)
            const voltar = new URLSearchParams(window.location.search).get('voltar');
            if (voltar && /^[a-z-]+\.html$/.test(voltar) && voltar !== 'login.html') {
                window.location.href = voltar;
                return true;
            }

            const perfil = await App.comLimiteDeTempo(App.perfil());
            window.location.href = perfil && perfil.tipo === 'ADMIN' ? 'admin.html' : 'cliente.html';
            return true; // continua travado enquanto a próxima página abre
        });
    }

    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        ligarFormulario(cadastroForm, 'Cadastrando...', async () => {
            const senha = document.getElementById('senha').value;
            if (senha.length < 6) {
                App.mensagem('status', 'A senha deve ter pelo menos 6 caracteres.', 'erro');
                return false;
            }

            const { data, error } = await App.comLimiteDeTempo(db.auth.signUp({
                email: document.getElementById('email').value.trim(),
                password: senha,
                options: {
                    data: {
                        nome: document.getElementById('nome').value.trim(),
                        telefone: document.getElementById('telefone').value.trim()
                    },
                    emailRedirectTo: urlDaPagina('login.html')
                }
            }));

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return false;
            }

            // Com confirmação de e-mail ligada no Supabase, a sessão só existe depois da confirmação
            if (!data.session) {
                cadastroForm.reset();
                App.mensagem('status', 'Cadastro feito! Enviamos um link de confirmação para o seu e-mail.');
                return false;
            }

            window.location.href = 'cliente.html';
            return true;
        });
    }

    const esqueciForm = document.getElementById('esqueciForm');
    if (esqueciForm) {
        ligarFormulario(esqueciForm, 'Enviando...', async () => {
            const { error } = await App.comLimiteDeTempo(db.auth.resetPasswordForEmail(
                document.getElementById('email').value.trim(),
                { redirectTo: urlDaPagina('nova-senha.html') }
            ));

            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return false;
            }
            // Mesma mensagem exista ou não o e-mail, para não revelar quem tem conta
            App.mensagem('status', 'Se este e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.');
            return false;
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

        ligarFormulario(novaSenhaForm, 'Salvando...', async () => {
            const senha = document.getElementById('novaSenha').value;
            if (senha.length < 6) {
                App.mensagem('status', 'A senha deve ter pelo menos 6 caracteres.', 'erro');
                return false;
            }

            const { error } = await App.comLimiteDeTempo(db.auth.updateUser({ password: senha }));
            if (error) {
                App.mensagem('status', App.traduzirErro(error), 'erro');
                return false;
            }

            await db.auth.signOut().catch(() => {});
            App.limparPerfil();
            novaSenhaForm.hidden = true;
            App.mensagem('status', 'Senha alterada com sucesso! Você já pode entrar com a nova senha.');
            return false;
        });
    }
});
