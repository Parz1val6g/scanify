import prisma from '../../shared/prisma.service';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { AppError } from '../../shared/app.error';

export class InvoiceRepository {
  async create(req: AuthRequest, data: any) {
    return await prisma.invoice.create({
      data: {
        ...data,
        userId: req.userId!
      }
    });
  }

  async findAll(req: AuthRequest) {
    if (['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(req.role ?? '')) {
      return await prisma.invoice.findMany({
        include: {
          sharedWith: true,
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    return await prisma.invoice.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { sharedWith: { some: { userId: req.userId } } }
        ]
      },
      include: {
        sharedWith: true,
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(req: AuthRequest, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id },
      include: { sharedWith: true }
    });

    if (!invoice) return null;

    if (req.role === 'SUPER_ADMIN') return invoice;
    if (req.role === 'COMPANY_ADMIN' && invoice.companyId === req.companyId) return invoice;
    if (invoice.userId === req.userId) return invoice;
    if (invoice.sharedWith.some((share: any) => share.userId === req.userId)) return invoice;

    throw new AppError(403, 'Sem autorização para aceder a esta fatura.');
  }

  async update(req: AuthRequest, id: string, data: any) {
    const invoice = await this.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');

    if (req.role !== 'SUPER_ADMIN' && invoice.userId !== req.userId && req.role !== 'COMPANY_ADMIN') {
      throw new AppError(403, 'Sem permissão para modificar esta fatura.');
    }

    return await prisma.invoice.update({
      where: { id },
      data
    });
  }

  async delete(req: AuthRequest, id: string) {
    const invoice = await this.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');

    if (req.role !== 'SUPER_ADMIN' && invoice.userId !== req.userId && req.role !== 'COMPANY_ADMIN') {
      throw new AppError(403, 'Sem permissão para eliminar esta fatura.');
    }

    return await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async share(req: AuthRequest, id: string, to_user_id: string) {
    const invoice = await this.findById(req, id);
    if (!invoice) throw new AppError(404, 'Fatura não encontrada.');

    return await prisma.$transaction(async (tx) => {
      // Bug fix: was using `prisma` instead of `tx` inside transaction
      const shared = await tx.sharedInvoice.upsert({
        where: {
          userId_invoiceId: { userId: to_user_id, invoiceId: id }
        },
        create: { invoiceId: id, userId: to_user_id },
        update: {}
      });

      await tx.sharedInvoiceAudit.create({
        data: {
          sharedInvoiceId: shared.id,
          fromUserId: req.userId!,
          toUserId: to_user_id,
        }
      });

      return shared;
    });
  }
}
