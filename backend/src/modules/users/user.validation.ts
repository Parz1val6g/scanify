import { z } from 'zod';
import { Status } from '@prisma/client';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/;
const passwordMessage = "Password deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial (@$!%*?&#+_-)";

const strongPassword = z.string()
    .min(8, "Password deve ter pelo menos 8 caracteres")
    .regex(passwordRegex, passwordMessage);

export const userIdParamSchema = z.object({
    id: z.string().uuid("ID inválido")
});

export const updateUserSchema = z.object({
    email: z.email("Email inválido").max(255, "Email muito longo").optional(),
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo").optional(),
    lastName: z.string().min(2, "Apelido deve ter pelo menos 2 caracteres").max(50, "Apelido muito longo").optional()
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Password atual é obrigatória"),
    newPassword: strongPassword
});

export const inviteUserSchema = z.object({
    email: z.email("Email inválido").max(255, "Email muito longo"),
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
    lastName: z.string().min(2, "Apelido deve ter pelo menos 2 caracteres").max(50, "Apelido muito longo")
});

export const updateStatusSchema = z.object({
    status: z.nativeEnum(Status),
    reason: z.string().max(255).optional()
});
