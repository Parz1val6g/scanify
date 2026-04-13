import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.service';

export const maintenanceMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        // 0. Permitir sempre rotas críticas para que admins possam entrar e desativar
        // Permitimos /profile para que o frontend carregue o estado do user
        if (req.path.includes('/auth/login') || req.path.includes('/auth/profile')) {
            return next();
        }

        // 1. Procurar definições de sistema via Query Raw (evita erro de client stale)
        const result = await prisma.$queryRaw`SELECT 1 as id, maintenance_mode FROM system_settings WHERE id = 1 LIMIT 1` as any[];
        const settings = result && result.length > 0 ? { maintenanceMode: result[0].maintenance_mode } : null;

        // 2. Se manutenção estiver ON 
        if (settings?.maintenanceMode) {
            // Se já temos o role (injetado por authMiddleware anterior em rotas específicas)
            if (req.role === 'SUPER_ADMIN') return next();

            // Caso contrário, tentamos "Auto-Auth" básico apenas para SUPER_ADMIN bypass
            const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
            if (token) {
                try {
                    const secret = process.env.JWT_SECRET as string;
                    const decoded = jwt.verify(token, secret) as any;
                    if (decoded.role === 'SUPER_ADMIN') {
                        req.role = decoded.role; // Injeta para uso posterior
                        return next();
                    }
                } catch (e) {
                    // Ignora erro de token aqui, o authMiddleware oficial tratará depois se necessário
                }
            }

            // Bloqueamos acesso comum
            return res.status(503).json({
                error: "Sistema em Manutenção",
                message: "O Scanify está atualmente em manutenção programada. Por favor, tente mais tarde.",
                status: 503
            });
        }

        return next();
    } catch (err: any) {
        // Silencia erro se a tabela ainda não existe (será criada pelo SystemService no Health Check)
        if (!err.message?.includes('42P01') && !err.message?.includes('does not exist')) {
            console.error("Maintenance Middleware Error:", err);
        }
        return next();
    }
};
