# PROJECT_LOG.md - Scanify

## Auditoria Real do Código e Estado Atual

### Funcionalidades já implementadas (OK)
- **Backend (Node.js + Express 5 + Prisma)**
  - Autenticação JWT completa (`login`, `register`, alterar password, `forgot-password`, `reset-password`).
  - Proteção avançada: `helmet`, `cors` (restrito a FRONTEND_URL), Rate Limiting (OWASP).
  - Middleware de Auth BOLA: Garante que os Users só acedem às faturas do seu `companyId` ou as criadas por si (`userId`).
  - Estrutura base de `schema.prisma` estabelecida:
    - Modelos: `User`, `Company`, `Invoice`, `SharedInvoice`, `PasswordReset`.
    - Enums definidos: `Role` (USER, COMPANY_ADMIN, SUPER_ADMIN), `InvoiceStatus`.
    - Soft-delete global ativado (`deletedAt`) suportado pelo global Prisma Service Interceptor.
  - Upload Seguro (Multer): Hash robusto, limites de tamanho e lista de MIME permitida (Imagens isoladas/protegidas em `download-image`).

- **Frontend (Vite + React 18)**
  - Scaffold Base: `App.jsx`, navegações protegidas, Tema `Light/Dark`, Título de Página Dinâmico (via `.env`).
  - Páginas Auth Ativas: Login, SignUp (com força de password), Forgot/Reset Password, NotFound.
  - Componentização Base: `Input`, `Button`, `Sidebar`, `TopHeader`, UI Skeletons nativos para suspense.
  - AuthContext robusto: Integração API para Checkin e Sessão persistente.

---

## 🚧 Tarefas Pendentes e Bugs a Corrigir 

### Backend (Infraestrutura e Funcionalidades)
- [ ] **Migrações:** Executar migrações finais na Base de Dados e aplicar um SEED de Roles e a primeira *Company* Admin.
- [ ] **Segurança Ambiental:** Mudar credenciais fracas no `./backend/.env` e assegurar uso de App Password do Email.
- [ ] **Endpoint Logout:** Criar `POST /api/auth/logout` para destruir a validade caso implementado de Refresh Tokens no futuro.
- [ ] **Integração Real OCR (Tesseract):** Mover lógica do `Conf` para um serviço que analise o NIF e Valor no momento do uplaod do ficheiro (ou extração em background).
- [ ] **Partilha (SharedInvoice):** Desenvolver Endpoint `POST /api/invoices/:id/share` que valida se o Recetor existe e cria a permissão.
- [ ] **Paginação de Faturas e Queries:** Query strings `?status=x&page=y&limit=z` em todos os GET Listings.
- [ ] **Company Admin Hub:** Editar logo ou morada e aprovar/recusar utilizadores que peçam para se juntar via convite.

### Frontend (User Interface)
- [ ] **Bugs Graves:** Sidebar "Terminar Sessão" não funciona (ausente _import_ `useNavigate`). `useAuth` não reflete o nome do _User_ no TopHeader dinamicamente.
- [ ] **Views de Fatura em Falta:** Tabela ou Gráficos do total na Home, `/invoices` atualmente vazios sem listar de facto os Cartões das faturas vindas da API, Vista detalhada `/invoices/:id` inexistente.
- [ ] **Users Panel:** Página Administrativa `/users` para visualizar a equipa da empresa.
- [ ] **Profile Settings:** Ver/Editar as informações pessoais do Utilizador Atual (`Profile.jsx` em stub).
- [ ] **Sistemas Secundários:** Toasts Global (Alertas de Sucesso/Erro Visuais), Modais Genéricas (Confirmações de Exclusão).
- [ ] **Segurança UX:** Cookies de HttpOnly devem substituir localStorage do token JWT face a ataques de injecção (XSS).

---

## Roadmap de Lançamento
1. **Infra e Schema** - Fechado e implementado na última iteração. SoftDelete e MultiTenants inserido.
2. **Correção UI** - Criar e ligar páginas em falta do React (Users, Invoice Detail) e corrigir Sidebar Logout.
3. **Mecânicas de Fatura** - Ativar o Upload com Extração OCR final e Partilha Segura por Roles.
4. **Acabamentos e Auditoria V2** - Mudar segredos .env, isolar ficheiros estáticos, testes unitários.

> Scanify: Migrado de (cam_proj). Código gerado com extrema atenção ao isolamento e performance React/Express.