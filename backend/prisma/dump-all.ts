import prisma from '../src/shared/prisma.service'
import * as fs from 'fs';

async function main() {
  console.log('📦 A extrair toda a base de dados...');

  const fullDatabase = {
    systemSettings: await prisma.systemSettings.findMany(),
    companies: await prisma.company.findMany(),
    users: await prisma.user.findMany(),
    invoices: await prisma.invoice.findMany(),
    sharedInvoices: await prisma.sharedInvoice.findMany(),
    sharedInvoiceAudits: await prisma.sharedInvoiceAudit.findMany(),
    userAuditLogs: await prisma.userAuditLog.findMany(),
    passwordResets: await prisma.passwordReset.findMany(),
  };

  // Escrever para um ficheiro JSON de forma legível
  fs.writeFileSync('db-dump-completo.json', JSON.stringify(fullDatabase, null, 2));
  
  console.log('✅ Dump completo guardado com sucesso no ficheiro: db-dump-completo.json');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao extrair os dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });