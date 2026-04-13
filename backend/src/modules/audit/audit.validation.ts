import { z } from 'zod';
import { AuditAction, Status } from '@prisma/client';

export const logsSchema = z.object({
    target: z.string().uuid("ID inválido").optional(),
    event: z.nativeEnum(AuditAction).optional(),
    result: z.nativeEnum(Status).optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    ip: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "IP inválido").optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional()
}).transform((data) => {
    const { target, event, result, start, ip, end, ...rest } = data;

    return {
        userId: target,
        action: event,
        newStatus: result,
        ...((start || end) && {
            createdAt: {
                ...(start && { gte: new Date(start) }),
                ...(end && { lte: new Date(end) })
            }
        }),

        ipAddr: ip,
        ...rest
    };
});
export const logIdParamSchema = z.object({
    id: z.string().uuid("ID inválido")
});