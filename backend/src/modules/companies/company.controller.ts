import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { CompanyService } from './company.service';

const service = new CompanyService();

export class CompanyController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await service.create(req, req.body);
      return res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companies = await service.list(req);
      return res.status(200).json(companies);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await service.getById(req, req.params.id as string);
      return res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await service.update(req, req.params.id as string, req.body);
      return res.status(200).json(company);
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
