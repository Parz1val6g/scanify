import prisma from '../../shared/prisma.service';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { AppError } from '../../shared/app.error';

export class UserRepository {
  async create(data: any) {
    return await prisma.user.create({ data });
  }

  async findAll(req: AuthRequest) {
    if (['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(req.role ?? ''))
      return await prisma.user.findMany();

    return await prisma.user.findMany({ where: { id: req.userId } });
  }

  async findByEmail(req: AuthRequest, email: string) {
    const where: any = { email };

    if (req.role !== 'SUPER_ADMIN')
      where.id = req.userId;

    const user = await (prisma.user as any).findFirst({
      where,
      select: {
        id: true,
        email: true,
        password: true, // Needed for bcrypt compare in profile logic
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    if (!user) throw new AppError(404, 'Utilizador não encontrado ou acesso negado.');

    return user;
  }

  async findById(req: AuthRequest, id: string) {
    const where: any = { id };

    if (req.role !== 'SUPER_ADMIN')
      where.id = req.userId;

    const user = await (prisma.user as any).findFirst({
      where,
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: { id: true, name: true }
        }
      }
    });
    if (!user) throw new AppError(404, 'Utilizador não encontrado ou acesso negado.');

    return user;
  }

  async update(req: AuthRequest, id: string, data: any) {
    await this.findById(req, id);
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(req: AuthRequest, id: string) {
    await this.findById(req, id);

    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
