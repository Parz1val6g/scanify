import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const service = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.login(req as any, req.body);

      const { token, user } = result;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      // Log the login action asynchronously
      service.recordLogin(req as any, result.user.id).catch(console.error);

      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.register(req as any, req.body);

      // Log the registration action
      service.recordRegister(req as any, user.id).catch(console.error);

      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await service.forgotPassword(req.body);
      // Sempre retornamos 200 genérico para evitar enumeração de contas
      return res.status(200).json({
        message: 'Se o email estiver registado, receberás um link de recuperação em breve.'
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await service.resetPassword(req as any, req.body);
      return res.status(200).json({ message: 'Password redefinida com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      await service.logout(req as any);
      return res.status(200).json({ message: 'Sessão terminada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
}
