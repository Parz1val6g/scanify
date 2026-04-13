import { PrismaClient } from '@prisma/client';
import { getContext } from './request-context';

const prismaClient = new PrismaClient();

export const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                // [OTIMIZAÇÃO] Casting para 'any' apenas dentro do hook para evitar 
                // que o TS tente validar a união de tipos de todas as operações.
                const anyArgs = args as any;

                // 1. Soft Delete: Filtro Global de Leitura (apenas para modelos que o suportam)
                const modelsWithSoftDelete = ["User", "Company", "Invoice"];
                const multiTenantModels = ["User", "Invoice", "SharedInvoice"];
                const modelName = model as string;

                // Multi-tenancy enforcement
                if (multiTenantModels.includes(modelName)) {
                    const ctx = getContext();
                    if (ctx?.companyId && ctx?.role !== 'SUPER_ADMIN') {
                        // Leitura
                        if (["findMany", "findFirst", "findUnique", "count"].includes(operation)) {
                            anyArgs.where = {
                                ...anyArgs.where,
                                companyId: ctx.companyId,
                            };
                        }
                        // Update/Delete
                        if (["update", "updateMany", "delete", "deleteMany"].includes(operation)) {
                            anyArgs.where = {
                                ...anyArgs.where,
                                companyId: ctx.companyId,
                            };
                        }
                        // Criação
                        if (["create", "createMany"].includes(operation)) {
                            anyArgs.data = {
                                ...anyArgs.data,
                                companyId: ctx.companyId,
                            };
                        }
                    }
                }

                if (modelsWithSoftDelete.includes(modelName)) {
                    if (["findMany", "findFirst", "findUnique", "count"].includes(operation)) {
                        anyArgs.where = {
                            ...anyArgs.where,
                            deletedAt: null
                        };
                    }

                    // 2. Soft Delete: Mutação de Delete para Update
                    if (operation === "delete" || operation === "deleteMany") {
                        // Converte model name para camelCase para aceder ao prismaClient
                        const clientModel = modelName.charAt(0).toLowerCase() + modelName.slice(1);
                        return (prismaClient as any)[clientModel].update({
                            where: anyArgs.where,
                            data: { deletedAt: new Date() },
                        });
                    }
                }

                return query(args);
            },
        },
    },
});

export default prisma;
