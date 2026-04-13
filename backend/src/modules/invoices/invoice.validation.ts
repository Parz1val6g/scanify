import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

const ACCEPTED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const createInvoiceSchema = z.object({
  value: z.number().min(0),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Data inválida' }),
  nif: z.string().length(9),
  description: z.string().optional(),
  imagePath: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional()
});

export const updateInvoiceSchema = z.object({
  value: z.number().min(0).optional(),
  date: z.string().optional(),
  nif: z.string().length(9).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional()
});

export const invoiceIdParamSchema = z.object({
  id: z.string().uuid("ID de fatura inválido")
});

export const shareInvoiceSchema = z.object({
  to_user_id: z.string().uuid("ID de utilizador inválido"),
});

export const scanSchema = z.object({
  fieldName: z.string(),
  originalName: z.string(),
  encoding: z.string(),
  mimeType: z.enum(ACCEPTED_MIME_TYPES, {
    message: 'Formato inválido. Apenas PDF, JPG ou PNG são aceites.'
  }),
  size: z.number().max(MAX_FILE_SIZE, { message: 'Ficheiro demasiado grande. O limite é 5MB.' }),
  path: z.string().min(1, { message: 'Camiho de ficheiro ausente.' })
});