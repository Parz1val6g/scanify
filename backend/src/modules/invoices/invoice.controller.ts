import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { InvoiceService } from './invoice.service';
import { AppError } from '../../shared/app.error';
import path from 'path';
import fs from 'fs';

const service = new InvoiceService();

export class InvoiceController {

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError(400, "Fatura não fornecida");
      const imgPath = req.file.path.replace(/\\/g, '/');
      const invoice = await service.create(req, imgPath);
      return res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  }

  // async create(req: any, res: Response, next: NextFunction) {
  //   try {
  //     const data = { ...req.body };
  //     if (data.value) data.value = parseFloat(data.value);
  //     if (req.file) {
  //       data.imagePath = req.file.path.replace(/\\/g, '/');
  //     }
  //     const invoice = await service.create(req, data);
  //     return res.status(201).json(invoice);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoices = await service.list(req);
      return res.status(200).json(invoices);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await service.getById(req, req.params.id as string);
      return res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };
      if (data.value) data.value = parseFloat(data.value);
      const invoice = await service.update(req, req.params.id as string, data);
      return res.status(200).json(invoice);
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

  async updateImage(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError(400, 'Imagem não fornecida.');
      const imagePath = req.file.path.replace(/\\/g, '/');
      const invoice = await service.updateImage(req, req.params.id as string, imagePath);
      return res.status(200).json(invoice);
    } catch (err) {
      next(err);
    }
  }

  async downloadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await service.getById(req, req.params.id as string);

      if (!invoice?.imagePath) {
        throw new AppError(404, 'Imagem não encontrada.');
      }

      const absolutePath = path.resolve(process.cwd(), invoice.imagePath);
      if (!fs.existsSync(absolutePath)) {
        throw new AppError(404, 'Ficheiro não encontrado no servidor.');
      }

      return res.sendFile(absolutePath);
    } catch (err) {
      next(err);
    }
  }

  async share(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await service.share(req, id as string);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
