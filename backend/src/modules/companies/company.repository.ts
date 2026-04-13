import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import prisma from '../../shared/prisma.service';
import { AppError } from '../../shared/app.error';

export class CompanyRepository {
  async create(req: AuthRequest, data: any) {
    return await prisma.company.create({
      data: {
        ...data,
        user: { connect: { id: req.userId! } }
      }
    });
  }

  async findAll(req: AuthRequest) {
    const where: any = {};
    if (req.role === 'SUPER_ADMIN') {
      // Sem restrição
    } else {
      where.userId = req.userId;
    }
    return await prisma.company.findMany({ where });
  }

  async findById(req: AuthRequest, id: string) {
    // BOLA Enforcement: admins/users can only see their own company (unless superadmin)
    if (req.role !== 'SUPER_ADMIN' && id !== req.companyId) {
      return null;
    }

    return await prisma.company.findFirst({
      where: { id }
    });
  }

  async update(req: AuthRequest, id: string, data: any) {
    const company = await this.findById(req, id);
    if (!company) throw new AppError(403, 'Sem autorização para modificar esta empresa.');
    return await prisma.company.update({ where: { id }, data });
  }

  async delete(req: AuthRequest, id: string) {
    const company = await this.findById(req, id);
    if (!company) throw new AppError(403, 'Sem autorização para eliminar esta empresa.');
    return await prisma.company.delete({ where: { id } });
  }
}
