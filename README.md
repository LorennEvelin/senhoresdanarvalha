# Barbearia Senhores da Navalha

Projeto acadêmico de desenvolvimento web com Java Spring Boot, Thymeleaf, Spring Security, JWT, MySQL e frontend responsivo.

## Objetivo

Plataforma de agendamento para barbearia, com cadastro de clientes, login seguro, agenda de serviços, painel administrativo e banco de dados relacional.

## Tecnologias

- Java 21
- Spring Boot 3.3.3
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- Thymeleaf + HTML/CSS/JS

## Estrutura do projeto

- `src/main/java/com/senhoresdanavalha/barbearia` — backend MVC e API REST
- `src/main/resources/templates` — páginas web
- `src/main/resources/static/assets` — CSS e JavaScript
- `src/main/resources/application.properties` — configuração da aplicação

## Requisitos locais

- Java 21+
- MySQL 8+
- Maven

## Configuração do banco

1. Crie um banco MySQL com o nome `barbearia_senhores`.
2. Atualize as credenciais no arquivo `application.properties` conforme o ambiente local.
3. Execute a aplicação.

## Execução

```bash
mvn spring-boot:run
```

A aplicação ficará disponível em:

- http://localhost:8080

## Login inicial

Para fins de demonstração, pode-se cadastrar um cliente normalmente ou criar um administrador no banco com o valor `ADMIN`.

## Observações

Este projeto foi organizado para apresentação acadêmica e pode ser expandido com:

- envio de e-mail
- WhatsApp
- relatórios em PDF
- gráficos
- upload de fotos
- cancelamentos e aprovação de agenda
