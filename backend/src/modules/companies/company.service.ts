import { CompanyRepository } from './company.repository';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { createCompanySchema, updateCompanySchema } from './company.validation';
import { AppError } from '../../shared/app.error';

export class CompanyService {
  private repo = new CompanyRepository();

  async create(req: AuthRequest, data: any) {
    if (req.role !== 'SUPER_ADMIN') throw new AppError(403, 'Sem autorização. Apenas SUPER_ADMIN pode criar empresas.');
    const parsed = createCompanySchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');
    return await this.repo.create(req, parsed.data);
  }

  async list(req: AuthRequest) {
    return await this.repo.findAll(req);
  }

  async getById(req: AuthRequest, id: string) {
    const company = await this.repo.findById(req, id);
    if (!company) throw new AppError(404, 'Empresa não encontrada.');
    return company;
  }

  async update(req: AuthRequest, id: string, data: any) {
    const parsed = updateCompanySchema.safeParse(data);
    if (!parsed.success) throw new AppError(400, 'Dados inválidos.');
    return await this.repo.update(req, id, parsed.data);
  }

  async delete(req: AuthRequest, id: string) {
    if (req.role !== 'SUPER_ADMIN') throw new AppError(403, 'Sem autorização. Apenas SUPER_ADMIN pode eliminar empresas.');
    return await this.repo.delete(req, id);
  }
}
