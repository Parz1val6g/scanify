import prisma from '../../shared/prisma.service';

export class AuditRepository {
    async create(data: any) {
        return await prisma.userAuditLog.create({ data });
    }

    async getFiltered(query: any, companyId?: string) {
        const { limit, offset, ...filters } = query;

        const take = limit ? Number(limit) : undefined;
        const skip = offset ? Number(offset) : undefined;

        // Clean filters to remove undefined values
        const whereClause: any = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                whereClause[key] = value;
            }
        });

        if (companyId) {
            whereClause.user = { companyId };
        }

        const [total, data] = await prisma.$transaction([
            prisma.userAuditLog.count({ where: whereClause }),
            prisma.userAuditLog.findMany({
                where: whereClause,
                take,
                skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            })
        ]);

        return {
            data,
            meta: {
                total,
                offset,
                limit
            }
        };
    }

    async findById(id: string) {
        return await prisma.userAuditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        companyId: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
    }
}