import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { AuditService } from './audit.service'

const service = new AuditService();

export class AuditController {
    async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const logs = await service.getLogs(req, req.query);
            return res.status(200).json(logs);
        } catch (err) {
            next(err);
        }
    }
    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const log = await service.getById(req, req.params.id as string);
            return res.status(200).json(log);
        } catch (err) {
            next(err);
        }
    }
}