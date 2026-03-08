# Centro Pokémon

> Aplicação desenvolvida em Node.js para auxiliar o gerenciamento de pokémons em um Centro Pokémon.  
> Este projeto integra o desafio técnico do processo seletivo para Desenvolvedor Júnior da SIMINT.

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Sobre o Projeto](#sobre-o-projeto)

---

## Tecnologias

![NodeJS](https://img.shields.io/badge/node.js-40a02b?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-d20f39.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-d20f39?style=for-the-badge&logo=jest&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-4c4f69?style=for-the-badge&logo=swagger&logoColor=white)

![React](https://img.shields.io/badge/react-181926.svg?style=for-the-badge&logo=react&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-181926?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-4c4f69.svg?style=for-the-badge&logo=typescript&logoColor=white)

![TailwindCSS](https://img.shields.io/badge/tailwindcss-179299.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/daisyui-7287fd?style=for-the-badge&logo=daisyui&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-4c4f69.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-4c4f69.svg?style=for-the-badge&logo=css3&logoColor=white)

![Postgres](https://img.shields.io/badge/postgres-1e66f5.svg?style=for-the-badge&logo=postgresql&logoColor=white) 
![JWT](https://img.shields.io/badge/JWT-181926?style=for-the-badge&logo=JSON%20web%20tokens)


### Documentação da API

A API da aplicação Pokémon Center foi documentada por utilizando Swagger e inclui alguns exemplos de dados e de respostas para cada requisição. 

Ao executar o projeto localmente, pode-se acompanhar a documentação por meio deste endereço: [`http://localhost:3001/api`](http://localhost:3001/api).

### Prototipação deste projeto

[![Figma - Link do Protótipo](https://img.shields.io/badge/Figma-%20Link%20do%20Prot%C3%B3tipo%20em%20breve-4c4f69?style=for-the-badge&logo=figma&logoColor=white)](#)

O visual da aplicação foi inspirado na própria estética dos jogos da franquia e outros elementos de UI/UX da Nintendo, como por exemplo Pokémon Go, Pokémon Sleep, Pokopia e Animal Crossing. 

A prototipação foi feita no Figma e pode ser visualizada por completo por meio deste [link](#).

![Previa do protótipo Pokemon Center](#)

## Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [PostgreSQL](https://www.postgresql.org/) instalado e rodando
- Banco de dados `pokemon_center` criado no PostgreSQL
```sql
CREATE DATABASE pokemon_center;
```

## Instalação

1. Clone este repositório:
```bash
git clone https://github.com/sammid37/PokemonCenter.git
cd pokemon-center
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Crie o arquivo `backend/.env` com as seguintes variáveis:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<seu_username>
DB_PASSWORD=<seu_password>
DB_NAME=pokemon_center

JWT_SECRET=<seu_jwt_secret>
JWT_EXPIRES_IN=7d
```
> Altere a porta do banco se necessário.

4. Inicie o backend:
```bash
# cd backend
npm run start:dev
```
> A API estará disponível em `http://localhost:3001`. As tabelas serão criadas automaticamente pelo TypeORM.

5. Em outro terminal, instale as dependências do frontend:
```bash
cd frontend
npm install
```

6. Crie o arquivo `frontend/.env.local` com as seguintes variáveis:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
> Altere a porta se necessário.

7. Inicie o frontend:
```bash
# cd frontend
npm run dev
```

8. Acesse [`http://localhost:3000`](http://localhost:3000) no navegador.

Você pode se cadastrar como:
- 🎒 **Treinador** — cadastra e gerencia seus próprios pokémons e solicita cuidados no Centro Pokémon
- 🏥 **Enfermeira Joy** — visualiza todos os pokémons cadastrados e aprova ou recusa as solicitações de cuidado dos treinadores

## Sobre o projeto

As funcionalidades a seguir foram implementadas conforme especificado no desafio técnico:

### Autenticação

* Cadastro de usuários com e-mail e senha
* Login com geração de token JWT
* Proteção de rotas — apenas usuários autenticados podem acessar o sistema

### Gerenciamento de Pokémons (CRUD)

* Cadastro de pokémons com os campos obrigatórios: nome, tipo, nível, HP e número da Pokédex

### Listagem de pokémons
* Edição de pokémons: apenas o treinador que cadastrou pode editar
* Exclusão de pokémons: apenas o treinador que cadastrou pode excluir

### Frontend

* Interface desenvolvida com React, Next.js e TypeScript
* Página de login e registro de treinadores
* Dashboard com listagem de pokémons em cards
* Formulário para adicionar e editar pokémons
* Modal de confirmação para exclusão

### Backend

* API RESTful desenvolvida com NestJS e TypeScript
* Banco de dados PostgreSQL com TypeORM
* Endpoints protegidos por autenticação JWT

---