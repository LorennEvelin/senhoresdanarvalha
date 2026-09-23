document.addEventListener('DOMContentLoaded', function () {
    const safeJson = async (response) => {
        const text = await response.text();
        if (!text) return {};

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            try {
                return JSON.parse(text);
            } catch (error) {
                return { message: 'Não foi possível processar a resposta do servidor.' };
            }
        }

        const compactText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (compactText.length > 0 && compactText.length < 200) {
            return { message: compactText };
        }

        return { message: 'Não foi possível processar a resposta do servidor.' };
    };

    const friendlyError = (message) => {
        if (!message) return 'Não foi possível processar a solicitação.';
        const plain = String(message).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return plain.length > 0 ? plain : 'Não foi possível processar a solicitação.';
    };

    const mobileToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('open')));
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await safeJson(response);
                if (response.ok && data.success) {
                    localStorage.setItem('jwtToken', data.token || '');
                    localStorage.setItem('userName', data.nome || '');
                    if (data.tipoUsuario === 'ADMIN') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/cliente/agendar';
                    }
                    return;
                }

                alert(friendlyError(data.message || 'Credenciais inválidas.'));
            } catch (error) {
                alert('Não foi possível conectar ao servidor. Tente novamente.');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const payload = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                senha: document.getElementById('senha').value
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await safeJson(response);
                if (response.ok && data.success) {
                    alert('Cadastro realizado com sucesso! Faça login para continuar.');
                    window.location.href = '/login';
                } else {
                    alert(friendlyError(data.message || 'Não foi possível realizar o cadastro.'));
                }
            } catch (error) {
                alert('Não foi possível concluir o cadastro.');
            }
        });
    }

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();

            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await safeJson(response);
                if (response.ok && data.success && data.token) {
                    const status = document.getElementById('forgotStatus');
                    if (status) {
                        status.style.display = 'block';
                        status.textContent = 'Solicitação enviada. Verifique seu e-mail para continuar a redefinição de senha.';
                    }
                    window.location.href = `/resetar-senha?token=${encodeURIComponent(data.token)}`;
                } else {
                    alert(friendlyError(data.message || 'Não foi possível processar a solicitação.'));
                }
            } catch (error) {
                alert('Não foi possível enviar a recuperação de senha.');
            }
        });
    }

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const token = document.getElementById('token').value.trim();
            const novaSenha = document.getElementById('novaSenha').value;

            if (!token || !novaSenha) {
                alert('Informe o token e a nova senha.');
                return;
            }

            try {
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, novaSenha })
                });

                const data = await safeJson(response);
                if (response.ok && data.success) {
                    alert('Senha redefinida com sucesso!');
                    window.location.href = '/login';
                } else {
                    alert(friendlyError(data.message || 'Não foi possível redefinir a senha.'));
                }
            } catch (error) {
                alert('Não foi possível redefinir a senha.');
            }
        });
    }

    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken && document.getElementById('token')) {
        document.getElementById('token').value = urlToken;
    }
});
