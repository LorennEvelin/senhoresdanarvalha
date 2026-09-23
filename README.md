# Barbearia Senhores da Navalha

Sistema web de agendamento para barbearia: o cliente se cadastra, escolhe serviço, barbeiro, data e horário, e acompanha ou cancela seus agendamentos. O administrador gerencia serviços, equipe e configurações da loja.

🔗 **Site no ar:** _(adicione aqui o link do Render)_

> Hospedado no plano gratuito: se o site estiver parado, o primeiro acesso pode levar até 1 minuto para carregar.

## Contas de demonstração

| Perfil  | E-mail                            | Senha        |
|---------|-----------------------------------|--------------|
| Admin   | `admin@senhoresdanavalha.com.br`  | `admin123`   |
| Cliente | `cliente.teste@teste.com`         | `cliente123` |

Também é possível criar uma conta nova em **Cadastro**.

## Funcionalidades

- Cadastro e login de clientes com senha criptografada (BCrypt)
- Autenticação por sessão e JWT, com controle de acesso por perfil (cliente / admin)
- Agendamento com verificação de horários ocupados por barbeiro
- Bloqueio de horários duplicados e de datas passadas
- Histórico e cancelamento de agendamentos pelo cliente
- Recuperação de senha por token com expiração
- Painel administrativo: edição de serviços e preços, equipe e configurações da loja
- Páginas públicas (serviços, equipe, preços) carregadas do banco de dados
- Layout responsivo para computador e celular

## Tecnologias

- **Backend:** Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, JWT (jjwt)
- **Frontend:** Thymeleaf, HTML, CSS e JavaScript
- **Banco de dados:** H2 (arquivo local); compatível com MySQL
- **Deploy:** Docker + Render

## Estrutura

```
src/main/java/com/senhoresdanavalha/barbearia
├── config/       # segurança, filtro JWT e dados iniciais
├── controller/   # páginas (MVC) e API REST
├── model/        # entidades JPA
├── repository/   # acesso ao banco
└── util/         # geração e validação de JWT
src/main/resources
├── templates/    # páginas Thymeleaf
└── static/assets # CSS e JavaScript
```

## Como rodar localmente

Requisitos: Java 21 e Maven.

```bash
mvn spring-boot:run
```

Acesse **http://localhost:8081**. O banco é criado automaticamente na pasta `data/`, já com as contas de demonstração, serviços e barbeiros.

## Variáveis de ambiente (opcionais)

| Variável              | Para que serve                         | Padrão local  |
|-----------------------|----------------------------------------|---------------|
| `PORT`                | Porta do servidor                      | `8081`        |
| `JWT_SECRET`          | Chave de assinatura dos tokens JWT     | valor de dev  |
| `ADMIN_SENHA`         | Senha inicial da conta admin           | `admin123`    |
| `CLIENTE_TESTE_SENHA` | Senha inicial do cliente de teste      | `cliente123`  |

## Deploy no Render

1. Em [render.com](https://render.com), clique em **New → Blueprint** e selecione este repositório.
2. O Render lê o `render.yaml`, gera o `JWT_SECRET` e publica usando o `Dockerfile`.

## Próximos passos

- Envio de e-mail na recuperação de senha
- Notificações por WhatsApp
- Relatórios e gráficos no painel admin
- Upload de fotos dos barbeiros
