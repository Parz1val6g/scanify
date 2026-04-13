import { AuditRepository } from './audit.repository';
import { UserRepository } from '../users/user.repository';
import { AppError } from '../../shared/app.error';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { Status, AuditAction } from '@prisma/client';

export class AuditService {
    private repo = new AuditRepository();
    private user_repo = new UserRepository();

    async recordAction(req: AuthRequest, userId: string, action: AuditAction, options?: { oldStatus?: Status, newStatus?: Status, metadata?: any }) {
        const ipAddr = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const finalMetadata = {
            ...(options?.metadata || {}),
            userAgent
        };

        return await this.repo.create({
            userId,
            action,
            oldStatus: options?.oldStatus,
            newStatus: options?.newStatus,
            ipAddr,
            metadata: finalMetadata
        });
    }

    async getLogs(req: AuthRequest, data: any) {
        if (req.role !== 'SUPER_ADMIN' && req.role !== 'COMPANY_ADMIN')
            throw new AppError(403, 'Acesso negado.');

        return await this.repo.getFiltered(data, req.companyId);
    }
    async getById(req: AuthRequest, id: string) {
        if (req.role !== 'SUPER_ADMIN' && req.role !== 'COMPANY_ADMIN') {
            throw new AppError(403, 'Acesso negado.');
        }

        const log = await this.repo.findById(id);
        if (!log) throw new AppError(404, "Log não encontrado.");

        if (req.role === 'COMPANY_ADMIN' && log.user.companyId !== req.companyId)
            throw new AppError(403, "Sem autorização para aceder a este log.");

        return log;
    }
};