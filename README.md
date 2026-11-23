# Fatec API — AT2 IEC

API REST em **Node.js + Express + TypeScript** com **PostgreSQL**, empacotada em **Docker** e entregue continuamente no **Render** via **GitHub Actions** (Deploy Hook).

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Mensagem de boas-vindas |
| GET | `/api/health` | Health check: `{"status":"ok","uptime":<segundos>}` |
| GET | `/alunos` | Lista alunos (lidos do PostgreSQL) |
| POST | `/alunos` | Cria aluno: `{"nome":"Ana Souza"}` (persiste no banco) |
| GET | `/disciplinas` | Lista disciplinas |
| POST | `/disciplinas` | Cria disciplina: `{"nome":"..."}` |

As tabelas `alunos` e `disciplinas` são criadas automaticamente na inicialização e recebem dados iniciais se estiverem vazias.

## Variáveis de ambiente

| Variável | Exemplo | Observação |
|----------|---------|------------|
| `PORT` | `3000` | O Render define automaticamente; fallback `3000` |
| `NODE_ENV` | `production` | |
| `DB_HOST` | `dpg-xxxx.oregon-postgres.render.com` | |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `fatec` | |
| `DB_USER` | `fatec_user` | |
| `DB_PASSWORD` | `********` | Nunca versionar |
| `DB_SSL` | `true` | `true` em bancos gerenciados (Render/Supabase); `false` local |

## Executar localmente

Requisitos: Node 20+ e Docker (para o PostgreSQL).

```bash
npm install            # gera package-lock.json; faça commit desse arquivo
npm run typecheck      # tsc --noEmit
npm test               # Vitest + Supertest
```

**Opção 1 — tudo com Docker Compose (API + banco):**

```bash
docker compose up --build
curl http://localhost:3000/api/health
```

**Opção 2 — só o banco no Docker e a API com Node:**

```bash
docker compose up -d db
cp .env.example .env   # ajuste se necessário (no Windows PowerShell: Copy-Item .env.example .env)
node --env-file=.env --import tsx src/server.ts  # executa com variáveis do .env
```

## Docker

```bash
docker build -t fatec-simple-api .
docker run --rm -p 3000:3000 -e DB_HOST=... -e DB_NAME=... -e DB_USER=... -e DB_PASSWORD=... -e DB_SSL=true fatec-simple-api
```

## Configurar o Render

1. **Banco:** New → **PostgreSQL** (ou use o Supabase) e anote host, porta, nome, usuário e senha.
2. **Web Service:** New → **Web Service** → conecte o repositório, branch `main`, runtime **Docker**.
3. **Auto-Deploy: `No`** (para o GitHub Actions controlar a publicação).
4. **Environment:** defina `NODE_ENV=production`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`.
5. **Advanced → Health Check Path:** `/api/health`.
6. **Settings → Deploy Hook:** copie a URL secreta.
7. **GitHub → Settings → Secrets and variables → Actions:** crie o secret `RENDER_DEPLOY_HOOK_URL` com essa URL.
8. Faça push na `main`: o workflow roda checagem de tipos, build e testes, depois `docker build` e, só se tudo passar, dispara o Deploy Hook (falha se o retorno não for HTTP 200/201).

> Nunca coloque o Deploy Hook ou senhas em commits, README ou prints do vídeo.

## Entrega

- **Repositório GitHub:** PREENCHER APÓS PUBLICAR
- **API pública no Render:** PREENCHER APÓS PUBLICAR (ex.: `https://SEU-SERVICO.onrender.com`)
- **Health público:** `https://SEU-SERVICO.onrender.com/api/health`
- **Vídeo de demonstração (3–4 min):** PREENCHER APÓS GRAVAR

## Checklist final para a avaliação

- [ ] Executar `npm install`, versionar `package-lock.json` e substituir `npm install` por `npm ci` no Dockerfile e no workflow.
- [ ] Executar `npm run typecheck`, `npm run build` e `npm test`.
- [ ] Executar `docker compose up --build` e testar GET `/api/health` e POST/GET `/alunos`.
- [ ] Publicar repositório público na branch `main`.
- [ ] Configurar Render com runtime Docker, Auto-Deploy `No` e Health Check Path `/api/health`.
- [ ] Configurar banco PostgreSQL e variáveis de ambiente no Render.
- [ ] Configurar secret `RENDER_DEPLOY_HOOK_URL` no GitHub.
- [ ] Fazer pequena alteração, commit e push e verificar todas as etapas verdes.
- [ ] Confirmar deploy nos Events/Logs e testar persistência no PostgreSQL remoto.
- [ ] Atualizar links públicos e gravar vídeo narrado de 3 a 4 minutos.

**Nota:** retorno HTTP 200/201 do Deploy Hook confirma que o Render aceitou a solicitação, não que o deploy terminou. Confirme o estado `Live` no painel.

Teste de entrega continua via GitHub Actions e Render.
