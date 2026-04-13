import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny, target: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[target]);
        
        if (!result.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: result.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }
        Object.defineProperty(req, target, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true
        });

        next();
    };
};
