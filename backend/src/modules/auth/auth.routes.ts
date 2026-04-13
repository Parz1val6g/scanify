import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../shared/middlewares/validate.middleware";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { UserController } from "../users/user.controller";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "./auth.validation";

// Exportamos por defeito o auth routes encapsulado
const router = Router();

// Binding do contexto
const controller = new AuthController();
const bind = (method: Function) => method.bind(controller);

const userController = new UserController();

router.post("/register", validate(registerSchema), bind(controller.register));
router.post("/login", validate(loginSchema), bind(controller.login));
router.post("/forgot-password", validate(forgotPasswordSchema), bind(controller.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), bind(controller.resetPassword));

// Alias estrito para manter a compatibilidade legacy do frontend React
router.get("/profile", authMiddleware as any, userController.getProfile.bind(userController));

// Logout (stateless JWT - revoga apenas no cliente; hook para audit log futuro)
router.post("/logout", authMiddleware as any, bind(controller.logout));

export default router;
