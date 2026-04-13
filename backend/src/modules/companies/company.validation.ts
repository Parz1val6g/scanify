import { z } from 'zod';

export const createCompanySchema = z.object({
    name: z.string().min(2, "O nome da empresa deve ter pelo menos 2 caracteres").max(255),
    location: z.string().max(255).optional()
});

export const updateCompanySchema = z.object({
    name: z.string().min(2).max(255).optional(),
    location: z.string().max(255).optional()
});

export const companyIdParamSchema = z.object({
    id: z.string().uuid("ID de empresa inválido")
});
