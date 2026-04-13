import { InvoiceRepository } from './invoice.repository';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { UserRepository } from '../users/user.repository';
import { AppError } from '../../shared/app.error';
import { runOCR, runLLamaVision, runConcensus } from '../../shared/invoiceScanner';
import fs from 'fs';
import path from 'path';

export class InvoiceService {

  private repo = new InvoiceRepository();

  async create(req: AuthRequest, imagePath: string) {
    const ocrRawOutput = await runOCR(imagePath);
    const visionRawOutput = await runLLamaVision(imagePath);
    const { consensusData, confidenceScore, manualReviewRequired } = await runConcensus(ocrRawOutput, visionRawOutput);

    return await this.repo.create(req, {
      ...consensusData,
      imagePath,
      ocrRawOutput,
      visionRawOutput, confidenceScore,
      manualReviewRequired,
      aiStatus: 'COMPLETED'
    });
  }

  // async create(req: AuthRequest, data: any) {
  //   return await this.repo.create(req, data);
  // }

  async list(req: AuthRequest) {
    return await this.repo.findAll(req);
  }

  async getById(req: AuthRequest, id: string) {
    const invoice = await this.repo.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');
    return invoice;
  }

  async update(req: AuthRequest, id: string, data: any) {
    return await this.repo.update(req, id, data);
  }

  async delete(req: AuthRequest, id: string) {
    return await this.repo.delete(req, id);
  }

  async updateImage(req: AuthRequest, id: string, imagePath: string) {
    const invoice = await this.repo.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');

    if (req.role !== 'SUPER_ADMIN' && invoice.userId !== req.userId && req.role !== 'COMPANY_ADMIN') {
      throw new AppError(403, 'Sem permissão para atualizar a imagem desta fatura.');
    }

    if (invoice.imagePath) {
      const oldPath = path.join(process.cwd(), invoice.imagePath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return await this.repo.update(req, id, { imagePath });
  }

  async share(req: AuthRequest, id: string) {
    const invoice = await this.repo.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');
    if (invoice.userId !== req.userId) throw new AppError(403, 'Sem permissão para partilhar esta fatura.');

    const { to_user_id } = req.body;
    const userRepo = new UserRepository();

    const toUser = await userRepo.findById(req, to_user_id);
    if (!toUser) throw new AppError(404, 'Utilizador recetor não encontrado.');
    if (req.companyId !== toUser.companyId) throw new AppError(403, 'Utilizadores não pertencem à mesma empresa.');

    return await this.repo.share(req, id, to_user_id);
  }
}
