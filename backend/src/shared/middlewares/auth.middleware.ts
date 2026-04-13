import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.service';
import { requestContext } from '../request-context';

export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
    companyId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: "Sessão expirada ou token não fornecido" });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            console.error('[Auth Error]: JWT_SECRET não configurado no .env');
            res.status(500).json({ error: "Erro interno do servidor" });
            return;
        }

        const decoded = jwt.verify(token, secret) as { userId: string; role: string; companyId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { status: true }
        });

        if (!user || ['BANNED', 'BLOCKED', 'DELETED'].includes(user.status)) {
            res.clearCookie('token');
            res.status(403).json({ error: "Sua conta está desativada ou restrita." });
            return;
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        req.companyId = decoded.companyId;

        // Pass next directly so the async function terminates cleanly after next() is called.
        // Using an arrow wrapper without return would leave the Promise unresolved from Express 5's POV.
        requestContext.run({ companyId: req.companyId, role: req.role }, next);
        return;
    } catch (err) {
        res.clearCookie('token');
        res.status(401).json({ error: "Sessão inválida ou expirada" });
        return;
    }
};