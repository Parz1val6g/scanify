import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import invoiceRoutes from './modules/invoices/invoice.routes';
import userRoutes from './modules/users/user.routes';
import companyRoutes from './modules/companies/company.routes';
import authRoutes from './modules/auth/auth.routes';
import auditRoutes from './modules/audit/audit.routes';
import systemRoutes from './modules/system/system.routes';
import { errorMiddleware } from './shared/middlewares/error.middleware';
// import { contextMiddleware } from './shared/middlewares/context.middleware';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser())

// ── Security Headers (OWASP M2) ──────────────────────────────────────────────
app.use(helmet());

// ── CORS Policy (OWASP M1) ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10kb' })); // Prevent large payload DoS

// app.use(contextMiddleware);

// ── Rate Limiting (OWASP H1) ─────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                   // max 15 attempts per window
  message: { error: 'Demasiadas tentativas. Tenta novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limit only to sensitive auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/users/invite', authLimiter);

// ── NOTE: /uploads static removed (H3) ───────────────────────────────────────
// Invoice images are now served only through authenticated endpoints.
// See invoice.routes.ts for the protected image route.

app.get('/', (req, res) => res.send('Scanify API v2'));

// ── API Routes (with Maintenance Guard) ──────────────────────────────────────
import { maintenanceMiddleware } from './shared/middlewares/maintenance.middleware';

// Aplicamos a manutenção antes das rotas, exceto para o Super Admin 
// (que é verificado dentro do middleware após o authMiddleware injetar o role)
app.use('/api', maintenanceMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/system', systemRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Scanify v2 a correr em http://localhost:${PORT}`);
});

