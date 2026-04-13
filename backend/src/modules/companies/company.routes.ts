import { Router } from "express";
import { CompanyController } from "./company.controller";
import { validate } from "../../shared/middlewares/validate.middleware";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import {
    createCompanySchema,
    updateCompanySchema,
    companyIdParamSchema
} from "./company.validation";

const router = Router();
const controller = new CompanyController();
const bind = (method: Function) => method.bind(controller);

router.use(authMiddleware as any);

router.post("/", validate(createCompanySchema), bind(controller.create));
router.get("/", bind(controller.list));
router.get("/:id", validate(companyIdParamSchema, "params"), bind(controller.getById));
router.put("/:id", validate(companyIdParamSchema, "params"), validate(updateCompanySchema), bind(controller.update));
router.delete("/:id", validate(companyIdParamSchema, "params"), bind(controller.delete));

export default router;
