# Backend — TODO Project Scanify
> Stack: Node.js · Express 5 · TypeScript · Prisma · PostgreSQL

---

## 🏛️ Arquitetura & Base
- [x] DDD — módulos `auth`, `users`, `companies`, `invoices`, `audit`
- [x] Padrão Repository → Service → Controller → Router em todos os domínios
- [x] `prisma.service.ts` global com extensão **Soft-Delete** automático
- [x] `index.ts` com todas as rotas registadas sob `/api/`

## 🔑 Autenticação
- [x] Login com bcrypt + JWT (1 dia de expiração)
- [x] Registo de novos utilizadores (com ou sem empresa nova)
- [x] Forgot Password — token UUID 15min, anti-enumeração
- [x] Reset Password — valida token e atualiza hash
- [x] `authMiddleware` — verifica Bearer JWT e injeta contexto
- [x] Logout endpoint — `POST /api/auth/logout`

## 👥 Gestão de Utilizadores
- [x] CRUD completo com BOLA (acesso por role + companyId)
- [x] Perfil próprio (`/api/users/me`) e alteração de password
- [x] **Invite user** — cria conta `PENDING`, envia email de setup
- [x] **Gestão de Status** — `ACTIVE`, `INACTIVE`, `BLOCKED`, `BANNED`, etc.
- [x] Proteção em tempo real no Middleware contra utilizadores bloqueados/banidos

## 🏢 Gestão de Empresas
- [x] CRUD completo com BOLA
- [x] Criação e eliminação restritas a `SUPER_ADMIN`

## 📄 Gestão de Faturas (Invoices)
- [x] CRUD completo com BOLA (owner, shared, admins)
- [x] Upload de imagem via Multer (`PATCH /:id/image`)
- [x] Download de imagem seguro via `InvoiceController`
- [x] Partilha de fatura entre membros da mesma empresa (`SharedInvoice`)
- [x] Remoção de `invoice_id` redundante no schema de partilha
- [ ] Workflow de status — `PENDING → APPROVED → PAID` com guards de role
- [ ] Pesquisa e filtros em `GET /api/invoices` (`?status=&from=&to=`)
- [ ] Paginação em todos os endpoints de listagem

## 🔍 Sistema de Auditoria
- [x] Tabela `UserAuditLog` e enum `AuditAction` no Prisma
- [x] `AuditService.recordAction` — captura automática de **IP** e **User-Agent**
- [x] Gravação de Logs: `LOGIN`, `LOGOUT`, `REGISTER`, `PASSWORD_RESET`
- [x] Gravação de Logs: `PROFILE_UPDATE`, `PASSWORD_CHANGE`
- [x] Gravação de Logs: `STATUS_CHANGE` (com `oldStatus` e `newStatus`)
- [x] Rotas de visualização de logs para Admins com filtragem por data/user/ip

## 🛡️ Segurança & Proteção
- [x] Helmet (Headers) e CORS (FRONTEND_URL)
- [x] Rate Limit em rotas sensíveis (Login, Forgot, Invite)
- [x] Sanitização de campos sensíveis (Password) no **Repository Level**
- [x] Prevenção de Path Traversal no upload de ficheiros
- [x] BOLA (Broken Object Level Authorization) implementado em todos os Services
- [x] [.env] no [.gitignore]

## 🛠️ Infraestrutura & Shared
- [x] `validate.middleware.ts` — Validação Zod genérica
- [x] `mail.service.ts` — Envio de emails (Invite/Reset)
- [x] `app.error.ts` & `error.middleware.ts` — Gestão de erros global
- [x] `multer.ts` — Configuração de segurança para uploads

## ♻️ Sistema de Reciclagem (Recycle Bin)
- [ ] **Bypass Global Filter:** Permitir ignorar o filtro de soft-delete em listagens admin
- [ ] **Listar Apagados:** Rota `GET /api/admin/recycle-bin`
- [ ] **Restaurar Dados:** Rota `PATCH /api/admin/recycle-bin/:id/restore`
- [ ] **Audit Restore:** Emitir log `REACTIVATED`

## 🚀 Ambiente & Deploy
- [ ] **Mudar password do DB** — password forte em `DATABASE_URL`
- [ ] **App Password Gmail** — configurar `EMAIL_PASS` corretamente
- [ ] **Testar arranque** — `npm run dev` final para validação total
- [ ] **Configurar fatiar IPs:** `app.set('trust proxy', true)` no `index.ts`

## 🔮 Futuro (Nice to Have)
- [ ] **httpOnly Cookie auth** — migrar JWT para cookies seguros
- [ ] **Refresh Token** — tokens de sessão longa (7d)
- [ ] **OCR** — extração automática de dados de faturas
- [ ] **PDF export** — gerar PDF de fatura
- [ ] **Logger estruturado** — Winston ou similar
- [ ] **Health check** — Endpoint `/health` para monitorização
- [ ] **Docker** — Containerização da aplicação
