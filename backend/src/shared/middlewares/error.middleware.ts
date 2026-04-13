import { Request, Response, NextFunction } from 'express';
import { AppError } from '../app.error';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Guard: if headers already sent (e.g. mid-stream error in Express 5), delegate to default handler
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message, code: err.code });
    }
    console.error(err); // log apenas erros inesperados
    return res.status(500).json({ error: 'Erro interno do servidor.' });
};
