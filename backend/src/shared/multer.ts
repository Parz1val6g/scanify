// middlewares/upload.ts
import multer from 'multer';
import path from 'path';

// ── Allowlisted MIME types & extensions (Superficial Check) ─────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Isto é uma validação superficial (baseada no que o cliente diz ser)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Tipo de ficheiro não permitido. Apenas JPG, JPEG, PNG, WEBP e PDF são aceites.'));
  }

  cb(null, true);
};

// 🔴 MUDANÇA CRÍTICA: Guardar em Memória RAM, NÃO no disco!
export const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max (Protege a RAM contra DoS)
});

export default upload;