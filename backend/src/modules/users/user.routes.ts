import { Router } from "express";
import { UserController } from "./user.controller";
import { validate } from "../../shared/middlewares/validate.middleware";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import {
    updateUserSchema,
    changePasswordSchema,
    userIdParamSchema,
    inviteUserSchema,
    updateStatusSchema
} from "./user.validation";

const router = Router();
const controller = new UserController();
const bind = (method: Function) => method.bind(controller);

router.use(authMiddleware as any);

router.get("/me", bind(controller.getProfile));
router.put("/me", validate(updateUserSchema), bind(controller.updateProfile));
router.patch("/me/password", validate(changePasswordSchema), bind(controller.changePassword));

router.get("/", bind(controller.list));
router.post("/invite", validate(inviteUserSchema), bind(controller.invite));
router.get("/:id", validate(userIdParamSchema, "params"), bind(controller.getById));
router.put("/:id", validate(userIdParamSchema, "params"), validate(updateUserSchema), bind(controller.update));
router.delete("/:id", validate(userIdParamSchema, "params"), bind(controller.delete));
router.patch("/:id/status", validate(userIdParamSchema, "params"), validate(updateStatusSchema), bind(controller.updateStatus));

export default router;
