import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { UserService } from './user.service';

const service = new UserService();

function sanitizeUser(user: any) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.getProfile(req);
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.updateProfile(req, req.body);
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.changePassword(req, req.body);
      return res.status(200).json({ message: 'Password atualizada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }

  async invite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.inviteUser(req, req.body);
      return res.status(201).json({ message: 'Convite enviado com sucesso.', user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.create(req.body);
      return res.status(201).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await service.list(req);
      return res.status(200).json(users.map(sanitizeUser));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.getById(req, req.params.id as string);
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await service.update(req, req.params.id as string, req.body);
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const user = await service.updateStatus(req, req.params.id as string, status, reason);
      return res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.delete(req, req.params.id as string);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
