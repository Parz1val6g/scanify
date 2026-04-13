<<<<<<< HEAD
# Scanify — Gestão e Auditoria de Faturas
> Uma solução completa para gestão de faturas com sistema de auditoria e controlo de estados.

---

## 🏗️ Estrutura Completa do Projeto

```text
scanify/
├── # Code Citations.md
├── .antigravityrules
├── .continueignore
├── docker-compose.yml
├── package-lock.json
├── package.json
├── prisma.config.js
├── PROJECT_LOG.md
├── README.md
├── backend/
│   ├── .env
│   ├── backend_todo.md
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma.config.ts.old
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20260309170507_init_enterprise_architecture/
│   │       ├── 20260311204532_init_scanify_modular_schema/
│   │       ├── 20260311221305_init_scanify_modular_schema/
│   │       ├── 20260312164725_add_user_status_and_audit/
│   │       ├── 20260312170843_add_user_audit_logs/
│   │       └── 20260316131246_status_added/
│   ├── src/
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   ├── audit/
│   │   │   │   ├── audit.controller.ts
│   │   │   │   ├── audit.repository.ts
│   │   │   │   ├── audit.routes.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │   └── audit.validation.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.repository.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── companies/
│   │   │   │   ├── company.controller.ts
│   │   │   │   ├── company.repository.ts
│   │   │   │   ├── company.routes.ts
│   │   │   │   ├── company.service.ts
│   │   │   │   └── company.validation.ts
│   │   │   ├── invoices/
│   │   │   │   ├── invoice.controller.ts
│   │   │   │   ├── invoice.repository.ts
│   │   │   │   ├── invoice.routes.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   └── invoice.validation.ts
│   │   │   └── users/
│   │   │       ├── user.controller.ts
│   │   │       ├── user.repository.ts
│   │   │       ├── user.routes.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.validation.ts
│   │   └── shared/
│   │       ├── app.error.ts
│   │       ├── auth.middleware.ts
│   │       ├── error.middleware.ts
│   │       ├── multer.ts
│   │       ├── prisma.service.ts
│   │       ├── validate.middleware.ts
│   │       └── services/
│   │           └── mail.service.ts
│   └── uploads/
│       ├── test_invoice.jpg
│       ├── (outras imagens de teste...)
└── frontend/
    ├── .env
    ├── eslint.config.js
    ├── frontend_todo.md
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets/
        │   ├── react.svg
        │   └── (screenshots de landing page e assets...)
        ├── components/
        │   ├── Button.jsx
        │   ├── Button.module.css
        │   ├── FluidBackground.jsx
        │   ├── index.js
        │   ├── Input.jsx
        │   ├── Input.module.css
        │   ├── NumberInput.jsx
        │   ├── NumberInput.module.css
        │   ├── PasswordCriteria.jsx
        │   ├── PasswordCriteria.module.css
        │   ├── ProtectedRoute.jsx
        │   ├── Sidebar.jsx
        │   ├── Sidebar.module.css
        │   ├── Skeleton.jsx
        │   ├── Skeleton.module.css
        │   ├── TopHeader.jsx
        │   └── TopHeader.module.css
        ├── context/
        │   ├── Auth.jsx
        │   ├── index.js
        │   └── Theme.jsx
        ├── layouts/
        │   ├── Dashboard.jsx
        │   ├── Dashboard.module.css
        │   └── index.js
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Dashboard.module.css
        │   ├── ForgotPassword.jsx
        │   ├── ForgotPassword.module.css
        │   ├── index.js
        │   ├── InvoiceGeneral.jsx
        │   ├── InvoiceGeneral.module.css
        │   ├── LandingPage.jsx
        │   ├── LandingPage.module.css
        │   ├── Login.jsx
        │   ├── Login.module.css
        │   ├── NotFound.jsx
        │   ├── NotFound.module.css
        │   ├── Profile.jsx
        │   ├── Profile.module.css
        │   ├── ResetPassword.jsx
        │   ├── ResetPassword.module.css
        │   ├── SignUp.jsx
        │   ├── SignUp.module.css
        │   ├── SkeletonTest.jsx
        │   ├── Users.jsx
        │   └── Users.module.css
        └── services/
            ├── auth.js
            └── index.js
```

---

## 🛠️ Tecnologias Principais
- **Backend**: Node.js, Express 5, TypeScript, Prisma (ORM), PostgreSQL.
- **Frontend**: React, Vite, CSS Modules (Vanilla CSS).
- **Segurança**: JWT, Bcrypt, BOLA (AuthZ), Helmet, Rate Limiting.

---

## 🚦 Como Iniciar (Ambiente Dev)

### 1. Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Documentação Interna Importante
- [Checklist Backend](./backend/backend_todo.md)
- [Checklist Frontend](./frontend/frontend_todo.md)
- [Log de Auditoria Técnica](./PROJECT_LOG.md)
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> frontend_repo/master
