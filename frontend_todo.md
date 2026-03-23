# Frontend — TODO Project Scanify
> Stack: React 18 · Vite · React Router v6 · CSS Modules · Lucide Icons

---

## 🏛️ Arquitetura & Core
- [x] Vite + React + CSS Modules (Configuração Inicial)
- [x] Lazy loading com `React.lazy()` + `Suspense` em todas as páginas
- [x] `ThemeProvider` — Dark/Light mode com deteção de sistema e localStorage
- [x] `AuthContext` — Gestão de estado global de utilizador e token
- [ ] Implementar banner de consentimento de cookies (RGPD)
- [ ] `<ErrorBoundary>` global para capturar falhas inesperadas

## 🔑 Autenticação & Sessão
- [x] Login — Formulário e redirecionamento
- [x] SignUp — Registo com validação de força de password (Skeleton integrado)
- [x] Forgot Password — Submissão de pedido de recuperação
- [x] Reset Password — Nova password via token de URL com critérios em tempo real
- [x] `ProtectedRoute` — Componente para proteger rotas privadas
- [x] Logout — Integração com `POST /api/auth/logout` no backend
- [ ] **Sessão Expirada**: Intercetar erros 401 para limpar contexto e redirecionar para Login

## 👥 Gestão de Utilizadores
- [ ] **Página de Perfil**: Ver dados próprios, editar nome/email e alterar password
- [x] **Lista de Utilizadores**: Rota `/users` criada e protegida
- [ ] **Listagem Real**: Fetch de utilizadores da empresa, filtragem básica
- [ ] **Sistema de Status**: Mostrar badges de status (`ACTIVE`, `PENDING`, `BLOCKED`, `BANNED`)
- [ ] **Status Admin UI**: Modal para Administradores mudarem status de utilizadores com campo de "Razão"
- [ ] **Avatar Dinâmico**: Gerar iniciais do utilizador no TopHeader e listas

## 📄 Gestão de Faturas (Invoices)
- [ ] **Fetch Real**: Carregar faturas do backend (`GET /api/invoices`)
- [ ] **Página de Detalhe**: Visualização completa de campos e imagem
- [ ] **Download Seguro**: Usar a nova rota `GET /api/invoices/:id/download-image` (bloqueada via Auth)
- [ ] **Partilha**: Modal para partilhar fatura com outros utilizadores da empresa
- [ ] **Preview de Imagem**: Modal/Lightbox para ver a fatura sem sair da página
- [ ] **Formulário de Criação**: Campos de NIF, Valor, Data e Upload via Multer

## 🔍 Auditoria & Sistema de Status
- [ ] **Painel de Atividade (Admin)**: Tabela de logs (`UserAuditLog`)
- [ ] **Filtros de Auditoria**: Pesquisa por utilizador, ação e intervalo de datas
- [ ] **Metadata Viewer**: Modal para ver o JSON detalhado de cada log (ex: campos alterados no perfil)
- [ ] **Parse de IPs/User-Agents**: Mostrar ícones de browser/SO baseados no User-Agent guardado

## ♻️ Reciclagem (Recycle Bin)
- [ ] **Dashboard de Apagados**: Vista administrativa de Users, Companies e Invoices em soft-delete
- [ ] **Botão Restaurar**: Ação para reativar registos (`PATCH /.../restore`) com log de auditoria automático

## 🎨 Componentes UI (Design System)
- [x] `Input` — Floating label, icon, estados de erro
- [x] `Button` — Variantes de estilo
- [x] `Skeleton` — Placeholders para carregamento assíncrono
- [x] `Sidebar` & `TopHeader` — Navegação e Breadcrumbs real-time
- [ ] `StatusBadge` — Componente reutilizável para cores de estados
- [ ] `Modal` — Estrutura base para diálogos e formulários popup

## 🛡️ Segurança & Performance
- [ ] **HTTP-only Cookies**: Migrar o token de localStorage para cookies para evitar roubo via XSS
- [ ] **Limpeza de Rotas**: Remover `/skeleton-test` antes da entrega
- [ ] **Paginação/Scroll**: Implementar `Ver mais` nas listas de faturas e auditoria
- [ ] **Layout Mobile**: Garantir que a Sidebar e tabelas são responsivas

## 🔮 Futuro (Nice to Have)
- [ ] **Dashboard Visual**: Gráficos de volume mensal de faturas (`recharts`)
- [ ] **OCR**: Extração automática de dados de faturas via imagem
- [ ] **PDF Export**: Gerar PDF a partir dos dados da fatura
- [ ] **i18n**: Suporte multilingue (PT/EN)
- [ ] **PWA**: Notificações e funcionamento offline básico
