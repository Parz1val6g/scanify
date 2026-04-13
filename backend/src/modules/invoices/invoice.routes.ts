import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { secureFileSaver } from '../../shared/middlewares/file.middleware';
import upload from '../../shared/multer';
import { validate } from '../../shared/middlewares/validate.middleware';
import { scanSchema, updateInvoiceSchema, invoiceIdParamSchema, shareInvoiceSchema } from './invoice.validation';


const router = Router();
const controller = new InvoiceController();
const bind = (method: Function) => method.bind(controller);

router.use(authMiddleware as any);

router.get('/', bind(controller.list));
router.get('/:id', validate(invoiceIdParamSchema, 'params'), bind(controller.getById));

router.post('/scan', secureFileSaver, upload.single('invoiceFile'), validate(scanSchema), bind(controller.create));
// router.post('/', upload.single('image'), bind(controller.create));

router.put('/:id', validate(invoiceIdParamSchema, 'params'), validate(updateInvoiceSchema), bind(controller.update));
router.patch('/:id/image', validate(invoiceIdParamSchema, 'params'), upload.single('image'), bind(controller.updateImage));
router.delete('/:id', validate(invoiceIdParamSchema, 'params'), bind(controller.delete));

// H3 Fix: Protected image serving — only authenticated users with access to the invoice can download it
router.get('/:id/download-image', validate(invoiceIdParamSchema, 'params'), bind(controller.downloadImage));

router.post('/:id/share', validate(shareInvoiceSchema), bind(controller.share));



export default router;
