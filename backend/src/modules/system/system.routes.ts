import { Router } from 'express';
import systemController from './system.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const router = Router();

// Endpoint de saúde
router.get('/health', authMiddleware, (req: any, res, next) => {
    if (req.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Acesso reservado a administradores globais" });
    }
    next();
}, systemController.getHealth);

// Inverter/Configurar Manutenção
router.post('/maintenance', authMiddleware, (req: any, res, next) => {
    if (req.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Apenas Super Admins podem alterar o estado do sistema" });
    }
    next();
}, systemController.toggleMaintenance);

// Limpar Cache
router.post('/clear-cache', authMiddleware, (req: any, res, next) => {
    if (req.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "Apenas Super Admins podem limpar o cache" });
    }
    next();
}, systemController.clearCache);

export default router;
