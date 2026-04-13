import { UserRepository } from './user.repository';
import { CompanyRepository } from '../companies/company.repository';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { updateUserSchema, changePasswordSchema, inviteUserSchema } from './user.validation';
import bcrypt from 'bcrypt';
import { AppError } from '../../shared/app.error';

import crypto from 'crypto';
import prisma from '../../shared/prisma.service';
import { sendInviteEmail } from '../../shared/services/mail.service';
import { AuditService } from '../audit/audit.service';
import { Status } from '@prisma/client';

export class UserService {
  private repo = new UserRepository();
  private company_repo = new CompanyRepository();
  private audit = new AuditService();

  async inviteUser(req: AuthRequest, data: any) {
    const parsed = inviteUserSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    if (req.role !== 'COMPANY_ADMIN' && req.role !== 'SUPER_ADMIN')
      throw new AppError(403, 'Acesso negado. Apenas Administradores podem convidar pessoal.');
    if (!req.companyId)
      throw new AppError(404, 'Empresa não encontrada ou token sem empresa.');

    const company = await this.company_repo.findById(req, req.companyId);
    if (!company) throw new AppError(404, 'Empresa não encontrada ou token sem empresa.');

    const existing = await this.repo.findByEmail(req, parsed.data.email);
    if (existing) throw new AppError(409, 'Este email já está registado noutra conta.');

    const randomPasswordString = crypto.randomBytes(16).toString('hex') + 'A1!';
    const hashedPassword = await bcrypt.hash(randomPasswordString, 12);

    const user = await this.repo.create({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      password: hashedPassword,
      // companyId: req.companyId,
      role: 'USER',
      status: Status.PENDING
    });

    const token = crypto.randomUUID();
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      }
    });
    try {
      await sendInviteEmail(user.email, token, company.name);
    } catch (e) {
      console.warn('Failed to dispatch invite email:', e);
    }

    return user;
  }

  async create(data: any) {
    return await this.repo.create(data);
  }

  async list(req: AuthRequest) {
    return await this.repo.findAll(req);
  }

  async getById(req: AuthRequest, id: string) {
    const user = await this.repo.findById(req, id);
    if (!user) throw new AppError(404, 'Utilizador não encontrado.');
    return user;
  }

  async update(req: AuthRequest, id: string, data: any) {
    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const updated = await this.repo.update(req, id, parsed.data);

    // Log the profile update
    this.audit.recordAction(req, id, 'PROFILE_UPDATE', {
      metadata: { fields: Object.keys(parsed.data) }
    }).catch(console.error);

    return updated;
  }

  async updateStatus(req: AuthRequest, id: string, newStatus: Status, reason?: string) {
    if (req.role !== 'SUPER_ADMIN' && req.role !== 'COMPANY_ADMIN')
      throw new AppError(403, 'Acesso negado. Apenas administradores podem mudar o status.');

    const user = await this.repo.findById(req, id);
    const oldStatus = user.status;

    const updated = await this.repo.update(req, id, { status: newStatus });

    this.audit.recordAction(req, id, 'STATUS_CHANGE', {
      oldStatus,
      newStatus,
      metadata: { reason }
    }).catch(console.error);

    return updated;
  }

  async delete(req: AuthRequest, id: string) {
    return await this.repo.delete(req, id);
  }

  // ---- PROFILE LOGIC ----

  async getProfile(req: AuthRequest) {
    return this.getById(req, req.userId!);
  }

  async updateProfile(req: AuthRequest, data: any) {
    return this.update(req, req.userId!, data);
  }

  async changePassword(req: AuthRequest, data: any) {
    const parsed = changePasswordSchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');

    const user = await this.repo.findById(req, req.userId!);
    if (!user) throw new AppError(404, 'Utilizador não encontrado.');

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) throw new AppError(401, 'Password atual incorreta.');

    const hashedNewPassword = await bcrypt.hash(parsed.data.newPassword, 12);
    const result = await this.repo.update(req, req.userId!, { password: hashedNewPassword });

    this.audit.recordAction(req, req.userId!, 'PASSWORD_CHANGE').catch(console.error);

    return result;
  }
}
