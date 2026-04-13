import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/;
const passwordMessage = "Password deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial (@$!%*?&#+_-)";

const strongPassword = z.string()
    .min(8, "Password deve ter pelo menos 8 caracteres")
    .regex(passwordRegex, passwordMessage);

export const registerSchema = z.object({
    email: z.email("Email inválido").max(255, "Email muito longo"),
    password: strongPassword,
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
    lastName: z.string().min(2, "Apelido deve ter pelo menos 2 caracteres").max(50, "Apelido muito longo"),
    companyId: z.string().uuid("ID de empresa inválido").optional(),
    companyName: z.string().min(2).max(100).optional()
});

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string().min(1, "Password é obrigatória")
});

export const forgotPasswordSchema = z.object({
    email: z.email("Email inválido")
});

export const resetPasswordSchema = z.object({
    token: z.string().uuid("Token inválido"),
    password: strongPassword
});
