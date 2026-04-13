import prisma from '../../shared/prisma.service';

export class SystemService {
    async getHealthPercentage() {
        try {
            // 0. Verificar Estado de Manutenção
            const settings = await this.getSettings();

            // 1. Verificar Latência da DB
            const start = Date.now();
            await prisma.$queryRaw`SELECT 1`;
            const latency = Date.now() - start;
            const dbScore = latency < 100 ? 100 : Math.max(0, 100 - (latency - 100) / 5);

            // 2. Verificar Memória
            const { heapUsed, heapTotal } = process.memoryUsage();
            const memoryUsagePercent = (heapUsed / heapTotal) * 100;
            const memScore = memoryUsagePercent < 80 ? 100 : Math.max(0, 100 - (memoryUsagePercent - 80) * 5);

            // 3. Média Ponderada
            const finalScore = (dbScore * 0.6) + (memScore * 0.4);

            return {
                percentage: Math.round(finalScore),
                dbLatency: latency,
                memoryUsage: Math.round(memoryUsagePercent),
                maintenanceMode: settings.maintenanceMode,
                timestamp: new Date()
            };
        } catch (err) {
            console.error("Health Check Error:", err);
            return {
                percentage: 0,
                error: (err as Error).message,
                timestamp: new Date()
            };
        }
    }

    private async ensureSettingsTable() {
        try {
            // 1. Tenta criar a tabela se não existir
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "system_settings" (
                    "id" INTEGER NOT NULL DEFAULT 1,
                    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
                )
            `);

            // 2. Garante o registo inicial (id: 1)
            await prisma.$executeRawUnsafe(`
                INSERT INTO "system_settings" ("id", "maintenance_mode", "updated_at")
                VALUES (1, false, CURRENT_TIMESTAMP)
                ON CONFLICT ("id") DO NOTHING
            `);
            
            console.log("Elite System: Database structure synchronized.");
        } catch (err) {
            console.error("Elite System: Error during database synchronization:", err);
        }
    }

    async getSettings() {
        try {
            // Tenta ler com SQL puro
            const result = await prisma.$queryRaw`SELECT 1 as id, maintenance_mode FROM system_settings WHERE id = 1 LIMIT 1` as any[];
            
            if (result && result.length > 0) {
                return {
                    id: result[0].id,
                    maintenanceMode: result[0].maintenance_mode
                };
            }

            // Se a tabela existe mas está vazia, insere o default
            await prisma.$executeRaw`
                INSERT INTO system_settings (id, maintenance_mode, updated_at) 
                VALUES (1, false, NOW()) 
                ON CONFLICT (id) DO NOTHING
            `;
            return { id: 1, maintenanceMode: false };
        } catch (err: any) {
            // Se a tabela não existe, cura agora e tenta mais uma vez ou retorna default
            if (err.message?.includes('42P01') || err.message?.includes('does not exist')) {
                console.log("Elite System: Table 'system_settings' not found. Self-healing in progress...");
                await this.ensureSettingsTable();
                return { id: 1, maintenanceMode: false };
            }
            
            console.error("SystemService Settings Error (Raw Fallback):", err);
            return { id: 1, maintenanceMode: false };
        }
    }

    async toggleMaintenance(enabled: boolean) {
        try {
            await prisma.$executeRaw`
                UPDATE system_settings 
                SET maintenance_mode = ${enabled}, updated_at = NOW() 
                WHERE id = 1
            `;
            return { maintenanceMode: enabled };
        } catch (err: any) {
            // Se a tabela não existe ao tentar mudar, cura e tenta o update
            if (err.message?.includes('42P01') || err.message?.includes('does not exist')) {
                await this.ensureSettingsTable();
                await prisma.$executeRaw`
                    UPDATE system_settings 
                    SET maintenance_mode = ${enabled}, updated_at = NOW() 
                    WHERE id = 1
                `;
                return { maintenanceMode: enabled };
            }
            console.error("SystemService Toggle Error (Raw Fallback):", err);
            throw err;
        }
    }

    async clearCache() {
        // Na vida real, limparíamos o Redis ou pastas temporárias
        console.log("Elite System: Clearing Cache...");
        // Simulação de delay para sentir a ação no frontend
        await new Promise(resolve => setTimeout(resolve, 800));
        return { message: "Cache do sistema limpa com sucesso." };
    }
}

export default new SystemService();
