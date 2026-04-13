import { AuthRepository } from './auth.repository';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendResetEmail } from '../../shared/services/mail.service';
import { AppError } from '../../shared/app.error';
import { AuditService } from '../audit/audit.service';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

const BCRYPT_SALT_ROUNDS = 12;

// ── Security: Crash on startup if critical env vars are missing ───────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
}
const JWT_SECRET_SAFE: string = JWT_SECRET;

export class AuthService {
  private repo = new AuthRepository();
  private audit = new AuditService();

  async login(req: AuthRequest, data: any) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const user = await this.repo.findUserByEmail(parsed.data.email);
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    // Block access for any non-ACTIVE status — SUSPENDED, BLOCKED, BANNED, DELETED all refused
    const BLOCKED_STATUSES = ['SUSPENDED', 'BLOCKED', 'BANNED', 'DELETED'];
    if (BLOCKED_STATUSES.includes(user.status)) {
      const messages: Record<string, string> = {
        SUSPENDED: 'A sua conta está suspensa. Contacte o administrador.',
        BLOCKED: 'A sua conta está bloqueada. Contacte o administrador.',
        BANNED: 'A sua conta foi banida permanentemente.',
        DELETED: 'Esta conta foi eliminada do sistema.'
      };
      throw new AppError(403, messages[user.status] || 'Acesso negado.');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, companyId: user.companyId },
      JWT_SECRET_SAFE,
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        company: (user as any).company
      },
      token
    };
  }

  async recordLogin(req: AuthRequest, userId: string) {
    return await this.audit.recordAction(req, userId, 'LOGIN');
  }

  async logout(req: AuthRequest) {
    if (req.userId) {
      await this.audit.recordAction(req, req.userId, 'LOGOUT');
    }
  }

  async register(req: AuthRequest, data: any) {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const { email, password, firstName, lastName, companyId, companyName } = parsed.data;

    const existing = await this.repo.findUserByEmail(email);
    if (existing) throw new AppError(409, 'Este email já se encontra registado.');

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const userData = { email, password: hashedPassword, firstName, lastName };

    let user;

    if (!companyId) {
      const name = companyName || `${firstName} ${lastName} Organization`;
      user = await this.repo.createUserWithCompanyTransaction(userData, name);
    } else {
      user = await this.repo.createUserForExistingCompany(userData, companyId);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };
  }

  async recordRegister(req: AuthRequest, userId: string) {
    return await this.audit.recordAction(req, userId, 'REGISTER');
  }

  async forgotPassword(data: any) {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const user = await this.repo.findUserByEmail(parsed.data.email);
    if (user) {
      await this.repo.clearPasswordResets(user.id);

      const token = crypto.randomUUID();
      await this.repo.createPasswordReset({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔐 [DEV ONLY] Reset Link: ${process.env.FRONTEND_URL}/reset-password?token=${token}\n`);
      }

      try {
        await sendResetEmail(user.email, token);
      } catch (e) {
        console.warn('⚠️ Serviço de email falhou a enviar SMTP. Token foi criado no sistema na mesma.');
      }
    }
    return true; // Always return success to prevent email enumeration
  }

  async resetPassword(req: AuthRequest, data: any) {
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const { token, password } = parsed.data;

    const resetRecord = await this.repo.findPasswordReset(token);
    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      throw new AppError(400, 'O link de recuperação é inválido ou expirou.');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await this.repo.updatePasswordAndInvalidateToken(resetRecord.userId, hashedPassword, token);

    await this.audit.recordAction(req, resetRecord.userId, 'PASSWORD_RESET').catch(console.error);

    return true;
  }
}
