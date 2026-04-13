import { Router } from "express";
import { AuditController } from "./audit.controller";
import { validate } from "../../shared/middlewares/validate.middleware";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import {
    logsSchema,
    logIdParamSchema
} from './audit.validation';

const router = Router();

const controller = new AuditController();
const bind = (method: Function) => method.bind(controller);

router.use(authMiddleware as any);

router.get('/', validate(logsSchema, "query"), bind(controller.getLogs));
router.get('/:id', validate(logIdParamSchema, "params"), bind(controller.getById));

export default router;