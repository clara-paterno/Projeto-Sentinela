# Sentinela

**Plataforma de registro e acompanhamento de denúncias e ocorrências para a Guarda Civil Municipal (GCM) de Piquet Carneiro, Ceará.**

Desenvolvido para o **Desafio Dev VORTEX — Universidade de Fortaleza (Unifor)**, o Sentinela conecta cidadãos e agentes da GCM por meio de duas interfaces integradas a uma API REST.

## Acesse o projeto

| Componente | Endereço | Disponibilidade |
| --- | --- | --- |
| **Painel GCM (PWA)** | [sentinela-gcm.vercel.app](https://sentinela-gcm.vercel.app) | Publicado na Vercel |
| **API** | [sentinela-backend-y2gl.onrender.com](https://sentinela-backend-y2gl.onrender.com/health) | Publicada no Render |
| **Aplicativo do cidadão** | React Native + Expo | Executado via Expo Go ou Expo Web |

> O painel da GCM exige credenciais de agente autorizado. O aplicativo do cidadão não possui, neste momento, um link público de instalação nativa.

## Sobre o projeto

O Sentinela foi criado para facilitar a comunicação entre a população e a Guarda Civil Municipal, permitindo registrar solicitações e acompanhar o andamento do atendimento de maneira organizada.

O sistema reúne três partes:

- **Aplicativo do cidadão:** registro e consulta de denúncias e ocorrências, inclusive com imagens.
- **Painel da GCM:** triagem, consulta, filtragem e atualização das solicitações.
- **Backend compartilhado:** validação, autenticação, regras de negócio, persistência de dados e gerenciamento de anexos.

### Arquitetura

```text
       Aplicativo do cidadão             Painel GCM (PWA)
        React Native / Expo              React / Vite
                  |                            |
                  +------------+---------------+
                               |
                         API REST / HTTPS
                     Node.js + Express + Zod
                               |
                    Prisma ORM + PostgreSQL
                               |
                       Render (produção)

                     Cloudinary (imagens)
                       acessado pela API
```

A autenticação dos agentes utiliza JWT. O acesso aos anexos no painel ocorre por uma rota protegida da API.

## Funcionalidades

### Aplicativo do cidadão

- Registro de **denúncias** e **ocorrências**.
- Seleção de categorias conforme o tipo de solicitação.
- Denúncias anônimas ou identificadas.
- Descrição e endereço do local da solicitação.
- Dados do solicitante e de pessoas envolvidas, quando aplicável.
- Envio de até **três imagens**.
- Geração de **protocolo** e **código privado de consulta**.
- Armazenamento local das referências das solicitações no dispositivo.
- Consulta do status e histórico de atualizações, incluindo observações da GCM.

### Painel GCM

- Login de agente com autenticação JWT.
- Dashboard com indicadores de solicitações.
- Listagem com filtros por tipo, categoria, situação e período.
- Paginação das solicitações.
- Visualização detalhada dos registros e dos dados informados.
- Visualização autenticada dos anexos.
- Atualização de status e registro de observações no histórico.
- Justificativa obrigatória para encerramento sem atendimento.
- Instalação no navegador como **Progressive Web App (PWA)**.

## Fluxo de uma solicitação

1. O cidadão registra uma denúncia ou ocorrência.
2. A API valida e armazena os dados no PostgreSQL; os anexos são enviados ao Cloudinary.
3. O cidadão recebe o protocolo e o código de consulta.
4. Um agente autenticado acessa a solicitação pelo painel GCM.
5. O agente atualiza o status e, quando necessário, adiciona uma observação.
6. O histórico é persistido no banco.
7. O cidadão consulta a solicitação e visualiza o estado atualizado.

### Estados e transições

```text
RECEBIDA
  ├── EM_ANALISE
  │    ├── EM_ATENDIMENTO
  │    │    ├── CONCLUIDA
  │    │    └── ENCERRADA_SEM_ATENDIMENTO
  │    └── ENCERRADA_SEM_ATENDIMENTO
  └── ENCERRADA_SEM_ATENDIMENTO
```

`CONCLUIDA` e `ENCERRADA_SEM_ATENDIMENTO` são estados finais. O encerramento sem atendimento exige uma justificativa.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js, TypeScript, Express 5, Zod |
| Persistência | PostgreSQL, Prisma ORM 7, `@prisma/adapter-pg` |
| Autenticação | JWT, bcryptjs |
| Anexos | Multer, Cloudinary |
| Testes do backend | Vitest, Supertest |
| Mobile | React Native, Expo, TypeScript, React Navigation, Expo SecureStore |
| Web/PWA | React, Vite, TypeScript, CSS, `vite-plugin-pwa` |
| Infraestrutura | Render (API e PostgreSQL), Vercel (painel GCM) |
| Versionamento | Git, GitHub |

**Compatibilidade do mobile:** a versão original foi desenvolvida com Expo SDK 57. A atualização para **SDK 58** foi testada em um iPhone na branch `teste/expo-sdk-58`. Ao integrar essa branch à `main`, confirme que o `package.json` e o lockfile atualizados foram enviados ao repositório.

## Estrutura do repositório

```text
Projeto-Sentinela/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── seed-agente.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── generated/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma7.config.ts
│   └── package.json
├── frontend/
│   ├── mobile/
│   │   ├── src/
│   │   └── package.json
│   └── web/
│       ├── src/
│       ├── public/
│       ├── vite.config.ts
│       └── package.json
└── README.md
```

Algumas pastas geradas, como `node_modules`, não são versionadas.

## Executando localmente

### Pré-requisitos

- Node.js e npm compatíveis com as dependências do projeto.
- PostgreSQL acessível para o backend.
- Credenciais próprias do Cloudinary.
- Expo Go compatível com o SDK da branch utilizada, caso queira testar no dispositivo.

> Execute cada conjunto de comandos a partir da pasta indicada. Os arquivos `.env` são locais e não devem ser enviados ao repositório.

### 1. Backend

Na pasta `backend/`:

```bash
npm ci --include=dev
npx prisma generate
npx prisma migrate deploy
npm run dev
```

A API inicia na porta `3000`, salvo se a variável `PORT` informar outra porta. Para verificar:

```text
GET http://localhost:3000/health
```

Crie um arquivo `backend/.env` com as **chaves** necessárias e valores próprios do seu ambiente:

```dotenv
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/sentinela?schema=public"
JWT_SECRET="DEFINA_UMA_CHAVE_SECRETA_FORTE"
CLOUDINARY_CLOUD_NAME="SEU_CLOUD_NAME"
CLOUDINARY_API_KEY="SUA_API_KEY"
CLOUDINARY_API_SECRET="SEU_API_SECRET"
CORS_ORIGINS="http://localhost:5173,http://localhost:4173,http://localhost:8081"
```

A URL e as credenciais acima são apenas exemplos. **Nunca utilize esses valores literalmente em produção**.

> O projeto usa `prisma7.config.ts` para configuração do Prisma 7 e `prisma/schema.prisma` para a modelagem. O Prisma Client é gerado em `src/generated/prisma`.

**Dados iniciais:** após aplicar as migrations, o banco ainda pode estar vazio. Para cadastrar as categorias em um ambiente local configurado:

```bash
node --env-file=.env --import tsx prisma/seed.ts
```

O arquivo `prisma/seed-agente.ts` permite criar um agente para testes, usando as variáveis `SEED_AGENTE_NOME`, `SEED_AGENTE_EMAIL` e `SEED_AGENTE_SENHA` (mínimo de 12 caracteres). Configure esses valores de forma privada antes de executá-lo:

```bash
node --env-file=.env --import tsx prisma/seed-agente.ts
```

Esse script atualiza a senha de um agente quando o e-mail já existe. **Não execute seeds inadvertidamente em produção.**

### 2. Painel GCM (web)

Na pasta `frontend/web/`:

```bash
npm ci
npm run dev
```

Crie um arquivo `frontend/web/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Para usar a API publicada, substitua o valor por:

```dotenv
VITE_API_URL=https://sentinela-backend-y2gl.onrender.com
```

Abra o endereço informado pelo Vite, geralmente `http://localhost:5173`. Para conferir a compilação de produção:

```bash
npm run build
npm run preview
```

### 3. Aplicativo do cidadão

Na pasta `frontend/mobile/`:

```bash
npm ci
npx expo start
```

Crie `frontend/mobile/.env` com um endereço de API acessível pelo ambiente em que o aplicativo está rodando:

```dotenv
EXPO_PUBLIC_API_URL=https://sentinela-backend-y2gl.onrender.com
```

Para testar no navegador:

```bash
npx expo start --web
```

Para conectar um dispositivo pelo túnel do Expo, quando necessário:

```bash
npx expo login
npx expo start --tunnel
```

O Expo Go deve ser compatível com a versão do SDK instalada. Ao testar em celular físico, `localhost` aponta para o próprio dispositivo, não para o computador; por isso, use uma URL acessível pelo celular.

> Variáveis `VITE_` e `EXPO_PUBLIC_` ficam expostas ao código cliente. **Nunca coloque senhas de banco, chaves JWT ou credenciais do Cloudinary nessas variáveis.**

## Endpoints principais

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| GET | `/health` | Público | Verificação da API |
| GET | `/categorias` | Público | Listagem de categorias |
| POST | `/solicitacoes` | Público | Registro de solicitação |
| POST | `/solicitacoes/consulta` | Público, com protocolo e código | Consulta de solicitação |
| POST | `/solicitacoes/anexos` | Público, com validações | Envio de anexos |
| POST | `/auth/login` | Público | Login do agente |
| GET | `/gcm/solicitacoes` | JWT | Listagem e filtros |
| GET | `/gcm/solicitacoes/:id` | JWT | Detalhes da solicitação |
| PATCH | `/gcm/solicitacoes/:id/status` | JWT | Mudança de status e histórico |
| GET | `/gcm/anexos/:id` | JWT | Acesso a anexos |

## Segurança e validações

O projeto implementa validação de entrada com Zod, hash de senha com bcryptjs, autenticação JWT para as rotas da GCM e controle das transições de status.

As consultas do cidadão usam **protocolo e código privado de consulta**. A visualização dos anexos no painel depende da autenticação do agente. O upload de imagens possui limitações de quantidade, tamanho e formato.

Em ambientes de produção, as credenciais ficam nas variáveis de ambiente dos provedores de hospedagem. Não inclua arquivos `.env` ou dados sensíveis em commits.

## Testes e validação

Os testes automatizados do backend utilizam Vitest e Supertest:

```bash
cd backend
npm test
```

Além dos testes automatizados, foi validado manualmente o fluxo integrado com a API em produção: registro de denúncia com imagem, autenticação da GCM, visualização do anexo, atualização do status e consulta posterior pelo cidadão. A PWA foi instalada e testada a partir da URL publicada; a versão mobile atualizada foi aberta e utilizada em iPhone via Expo Go.

## Deploy

- **Backend e PostgreSQL:** Render.
- **Painel GCM:** Vercel, com diretório raiz `frontend/web` e saída de build `dist`.
- **Imagens:** Cloudinary.

O frontend web utiliza a variável `VITE_API_URL` configurada no ambiente de build da Vercel. No Render, `CORS_ORIGINS` deve conter os endereços dos frontends autorizados, incluindo o domínio da Vercel.

O backend utiliza os seguintes comandos de produção:

```bash
# Build
npm ci --include=dev && npx prisma generate

# Start
npx prisma migrate deploy && npm start
```

As migrations não substituem o cadastro dos dados iniciais: categorias e agentes precisam ser cadastrados separadamente no banco de destino.

## Contexto acadêmico

Projeto desenvolvido no âmbito do **Desafio Dev VORTEX**, da **Universidade de Fortaleza (Unifor)**, com foco em entregar um sistema funcional de comunicação entre cidadãos e Guarda Civil Municipal.

**Sentinela — comunicação, acompanhamento e organização das solicitações da comunidade.**
