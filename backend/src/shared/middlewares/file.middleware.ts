// middlewares/fileSecurity.ts
import { Request, Response, NextFunction } from 'express';
import { fromBuffer } from 'file-type';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { AppError } from '../app.error';

const BASE_FOLDER = '../../uploads';

const ALLOWED_REAL_MIMES = ['image/jpeg','image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export const secureFileSaver = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) throw new AppError(400, 'Nenhum ficheiro enviado.');

    try {
        const fileInfo = await fromBuffer(req.file.buffer);

        if (!fileInfo || !ALLOWED_REAL_MIMES.includes(fileInfo.mime))
            throw new AppError(415, 'Ataque ou ficheiro corrompido detetado. A assinatura digital não corresponde a uma imagem ou PDF válido.')

        const fileHash = crypto.randomBytes(16).toString('hex');
        const safeFilename = `${fileHash}.${fileInfo.ext}`;

        const uploadDir = path.join(__dirname, BASE_FOLDER);
        const safePath = path.join(uploadDir, safeFilename);

        await fs.writeFile(safePath, req.file.buffer);

        req.file.path = safePath;
        req.file.filename = safeFilename;
        req.file.mimetype = fileInfo.mime;

        next();

    } catch (error) {
        console.error('[Security Error]: Erro ao inspecionar ficheiro', error);
        throw new AppError(500, 'Erro interno ao processar a segurança do ficheiro.');
    }
};