import { Request, Response, NextFunction } from 'express';
import systemService from './system.service';

export class SystemController {
    async getHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const health = await systemService.getHealthPercentage();
            return res.json(health);
        } catch (err) {
            next(err);
        }
    }

    async toggleMaintenance(req: Request, res: Response, next: NextFunction) {
        try {
            const { enabled } = req.body;
            const updated = await systemService.toggleMaintenance(enabled);
            return res.json({ 
                message: `Modo manutenção ${enabled ? 'ativado' : 'desativado'}`,
                maintenanceMode: updated.maintenanceMode 
            });
        } catch (err) {
            next(err);
        }
    }

    async clearCache(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await systemService.clearCache();
            return res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new SystemController();
