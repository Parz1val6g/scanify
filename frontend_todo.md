# Frontend — TODO
> Stack: React 18 · Vite · React Router v6 · CSS Modules · Lucide Icons

---

## 🔴 Prioridade Máxima — Partilha de Faturas (Invoice Sharing)

- [ ] **`src/services/invoices.js`** — Criar o ficheiro de serviços (não existe): `fetchInvoices()`, `fetchInvoiceById()`, `createInvoice()`, `updateInvoice()`, `deleteInvoice()`, `shareInvoice(invoiceId, toUserId)`
- [ ] **`InvoiceGeneral.jsx`** — Fazer o fetch real de `GET /api/invoices` ao montar o componente e preencher a lista (atualmente está sempre vazio)
- [ ] **`InvoiceGeneral.jsx`** — Adicionar botão "Partilhar" por fatura que abre um modal de seleção de utilizador
- [ ] **Modal de Partilha** — Criar `src/components/ShareModal.jsx`: campo de seleção de utilizador (da mesma empresa), botão de confirmar que chama `POST /api/invoices/:id/share` com `to_user_id`
- [ ] **`src/services/users.js`** — Criar `fetchUsers()` para popular o dropdown de seleção de utilizador no modal de partilha

---

## ✅ Feito

### Core
- [x] Vite + React + CSS Modules
- [x] Lazy loading com `React.lazy()` + `Suspense` em todas as páginas
- [x] `React.StrictMode`
- [x] [ScrollToTop](file:///c:/Users/joelt/cam_proj/frontend/src/App.jsx#46-53) ao mudar de rota
- [x] `ThemeProvider` — dark/light mode com deteção do sistema e persistência em localStorage
- [x] Título dinâmico via [.env](file:///c:/Users/joelt/cam_proj/backend/.env) (`VITE_APP_NAME`)

### Auth
- [x] `AuthContext` — [login](file:///c:/Users/joelt/cam_proj/backend/src/modules/auth/auth.service.ts#21-48), [register](file:///c:/Users/joelt/cam_proj/frontend/src/context/Auth.jsx#41-44), [logout](file:///c:/Users/joelt/cam_proj/frontend/src/context/Auth.jsx#45-51), [getToken](file:///c:/Users/joelt/cam_proj/frontend/src/context/Auth.jsx#10-12), `isAuthenticated`, `loading`
- [x] Token persistido em localStorage (⚠️ ver segurança abaixo)
- [x] Sessão restaurada ao recarregar via `GET /api/auth/profile`
- [x] [ProtectedRoute](file:///c:/Users/joelt/cam_proj/frontend/src/components/ProtectedRoute.jsx#4-12) implementado

### Páginas Completas
- [x] **Login** — formulário, auth via contexto, redirect pós-login
- [x] **SignUp** — validação completa (nome, email, força de password, confirmar), skeleton durante submit
- [x] **ForgotPassword** — submissão de email, estado de sucesso
- [x] **ResetPassword** — token por URL, nova password + confirmar, critérios em tempo real
- [x] **NotFound** — página 404

### Componentes
- [x] `Input` — floating label, icon, error state, `forwardRef`, 9 tipos
- [x] `Button` — variantes primary/secondary
- [x] `PasswordCriteria` — indicador de força em tempo real
- [x] [Skeleton](file:///c:/Users/joelt/cam_proj/frontend/src/pages/SignUp.jsx#8-20) + `SkeletonBlock` — placeholders de loading
- [x] `Sidebar` — navegação, logout, logo
- [x] `TopHeader` — breadcrumbs, toggle de tema, link de perfil dinâmico via `user?.firstName`
- [x] `FluidBackground` — fundo animado

### Serviços
- [x] [loginService](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#28-47), [registerService](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#60-101), [fetchProfile](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#102-112)
- [x] [forgotPassword](file:///c:/Users/joelt/cam_proj/backend/src/modules/auth/auth.service.ts#81-109), [resetPassword](file:///c:/Users/joelt/cam_proj/backend/src/modules/auth/auth.controller.ts#43-53)
- [x] [validateEmail](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#1-9), [validatePassword](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#10-27)
- [x] [logoutService](file:///c:/Users/joelt/cam_proj/frontend/src/services/auth.js#48-59) (atualmente vazio — ver bugs)

---

## 🐛 Bugs a Corrigir

- [x] **Sidebar crash ao fazer logout** — `navigate` é chamado mas `useNavigate()` nunca foi importado → app congela ao clicar "Terminar Sessão"
- [x] **Nome hardcoded no TopHeader** — "Olá, Joel Martins!" deve vir de `user?.firstName` via [useAuth()](file:///c:/Users/joelt/cam_proj/frontend/src/context/Auth.jsx#59-60)
- [x] **`/users` leva ao 404** — Sidebar tem link para `/users` mas a rota não existe em `App.jsx`
- [x] **`ProtectedRoute` nunca usado** — `App.jsx` usa `RootConditional` mas não wraps as rotas com `<ProtectedRoute>`; adicionar nas rotas `/invoices`, `/profile`, `/users`
- [x] **`logoutService` vazio** — não chama o backend nem está ligado ao contexto Auth

---

## 📄 Ficheiros a Criar (Para o Site Estar Completo)

### Páginas Novas
- [x] **`src/pages/Users.jsx`** + `Users.module.css` — stub criado, rota `/users` registada em `App.jsx` dentro de `ProtectedRoute`
- [ ] **`src/pages/Users.jsx`** — implementar lista real: fetch de utilizadores da empresa, badge de role, botão de convite (COMPANY_ADMIN+)
- [ ] **`src/pages/Profile.jsx`** — implementar: ver info do utilizador, editar nome/email (`PUT /api/users/me`), alterar password (`PATCH /api/users/me/password`)
- [ ] **`src/pages/InvoiceDetail.jsx`** + `InvoiceDetail.module.css` — vista completa de uma fatura: editar campos, ver imagem, badge de status, apagar

### Componentes Novos
- [ ] **`src/components/InvoiceCard.jsx`** + CSS — card com NIF, valor, badge de status, data; usado na lista de faturas
- [ ] **`src/components/StatusBadge.jsx`** — pill colorido para status de fatura (`PENDING`, `APPROVED`, `PAID`, `REJECTED`)
- [ ] **`src/components/Modal.jsx`** + CSS — modal reutilizável para confirmações (apagar, aprovar) e formulário de convite
- [ ] **`src/components/UserCard.jsx`** + CSS — card de utilizador com inicial/avatar, nome, email, badge de role
- [ ] **`src/components/Avatar.jsx`** — iniciais do utilizador (ex: "JM" de "Joel Martins") para TopHeader e UserCard

### Serviços Novos
- [ ] **`src/services/invoices.js`** — `fetchInvoices()`, `fetchInvoiceById()`, `createInvoice()`, `updateInvoice()`, `deleteInvoice()`, `uploadInvoiceImage()`
- [ ] **`src/services/users.js`** — `fetchUsers()`, `updateProfile()`, `changePassword()`, `inviteUser()`

### Rotas a Registar em `App.jsx`
- [x] `<Route path="users" element={<Users />} />` — dentro de `<ProtectedRoute>`
- [ ] `<Route path="profile" element={<Profile />} />` — dentro de `<ProtectedRoute>`
- [ ] `<Route path="invoices/:id" element={<InvoiceDetail />} />` — dentro de `<ProtectedRoute>`

---

## 🚧 Páginas Existentes Incompletas

- [ ] **`InvoiceGeneral.jsx`** — barra de pesquisa existe; hook error de `useCallback+debounce` corrigido; falta: fetch real de `/api/invoices`, renderizar lista de `InvoiceCard`, botão de partilha
- [ ] **`Dashboard.jsx`** — "Total Pendente" mostra contagem em vez de valor monetário (€); falta mais estatísticas
- [ ] **`LandingPage.jsx`** — apenas stub vazio; decidir se é página de marketing pública ou redirect para login

---

## 🔜 Segurança a Resolver

- [ ] **JWT em localStorage** — migrar para cookie `httpOnly` (elimina risco de roubo por XSS)
- [ ] **Auto logout em 401** — interceptar todos os `fetch`; se resposta for 401 → chamar `logout()` automaticamente
- [ ] **Aviso de sessão a expirar** — toast 5min antes de o JWT expirar, com opção de renovar

---

## 🔮 Futuro (Nice to Have)

- [ ] **Sistema de toasts** — notificações de sucesso/erro/info
- [ ] **Preview de imagem** — lightbox/modal para ver a imagem da fatura
- [ ] **Filtros na lista de faturas** — por status, intervalo de datas, NIF
- [ ] **Paginação** — botão "ver mais" ou scroll infinito
- [ ] **Empty states** — ilustração SVG quando a lista está vazia
- [ ] **Estado de erro** — mensagem + botão retry quando API falha
- [ ] **Layout mobile** — sidebar colapsável, formulários adaptados
- [ ] **Formulário de criação de fatura** — NIF, valor, data, descrição, upload de imagem
- [ ] **Download PDF** — botão para gerar PDF da fatura
- [ ] **Dashboard com gráficos** — volume mensal com `recharts`
- [ ] **Company settings page** — editar nome e logotipo da empresa
- [ ] **UI por role** — esconder "Utilizadores" para role `USER`; mostrar "Convidar" só a `COMPANY_ADMIN`+
- [ ] **i18n** — suporte a EN/PT com `react-i18next`
- [ ] **PWA** — `manifest.json` + service worker para uso offline
- [ ] Remover rota `/skeleton-test` antes de produção
- [ ] Apagar `App.css` (ficheiro vazio, não é importado em lado nenhum)
- [ ] `<ErrorBoundary>` global para erros React não capturados
