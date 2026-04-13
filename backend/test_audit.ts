import { AuditRepository } from './src/modules/audit/audit.repository';
import prisma from './src/shared/prisma.service';

async function test() {
    console.log("--- SCANIFY AUDIT DIAGNOSTIC ---");
    const repo = new AuditRepository();
    try {
        console.log("Step 1: Testing direct prisma.userAuditLog.count()...");
        const count = await prisma.userAuditLog.count();
        console.log(`Direct count result: ${count}`);

        console.log("Step 2: Testing direct findMany with include...");
        const rawLogs = await prisma.userAuditLog.findMany({
            take: 1,
            include: { user: true }
        });
        console.log(`Direct findMany result: ${rawLogs.length} logs found`);

        console.log("Step 3: Testing AuditRepository.getFiltered...");
        const result = await repo.getFiltered({ limit: 5 });
        console.log(`Repository result: ${result.data.length} logs returned`);
        
        console.log("--- DIAGNOSTIC COMPLETE: SUCCESS ---");
    } catch (e: any) {
        console.error("--- DIAGNOSTIC FAILED ---");
        console.error("Error Name:", e.name);
        console.error("Error Message:", e.message);
        if (e.code) console.error("Prisma Error Code:", e.code);
        if (e.meta) console.error("Prisma Error Meta:", JSON.stringify(e.meta));
        if (e.stack) console.error("Stack Trace:", e.stack);
    } finally {
        await prisma.$disconnect();
    }
}

test();
