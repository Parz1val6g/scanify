// import { PrismaClient, Role, Status, InvoiceStatus, AuditAction } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//     console.log('Limpando a base de dados...');
    
//     // Limpar por ordem reversa de dependência
//     await prisma.userAuditLog.deleteMany();
//     await prisma.sharedInvoiceAudit.deleteMany();
//     await prisma.sharedInvoice.deleteMany();
//     await prisma.invoice.deleteMany();
//     await prisma.passwordReset.deleteMany();
//     await prisma.company.deleteMany();
//     await prisma.user.deleteMany();

//     console.log('Iniciando o seeding com dados realistas...');

//     const hashedPassword = await bcrypt.hash('password123', 10);

//     // 1. Criar Super Admin (Independente de empresa no início)
//     const superAdmin = await prisma.user.create({
//         data: {
//             email: 'admin@scanify.com',
//             firstName: 'Joel',
//             lastName: 'Martins',
//             password: hashedPassword,
//             role: Role.SUPER_ADMIN,
//         }
//     });

//     // 2. Criar Empresas Profissionais
//     const techCorp = await prisma.company.create({
//         data: {
//             name: 'Innovatech Solutions',
//             location: 'Lisboa, Portugal',
//             userId: superAdmin.id, // Joel é o owner no sistema por agora
//         }
//     });

//     const retailGlobal = await prisma.company.create({
//         data: {
//             name: 'RetailGlobal SA',
//             location: 'Porto, Portugal',
//             userId: superAdmin.id,
//         }
//     });

//     // 3. Criar Admins de Empresa
//     const companyAdmin1 = await prisma.user.create({
//         data: {
//             email: 'ana.silva@innovatech.com',
//             firstName: 'Ana',
//             lastName: 'Silva',
//             password: hashedPassword,
//             role: Role.COMPANY_ADMIN,
//             companyId: techCorp.id,
//         }
//     });

//     const companyAdmin2 = await prisma.user.create({
//         data: {
//             email: 'carlos.pereira@retailglobal.pt',
//             firstName: 'Carlos',
//             lastName: 'Pereira',
//             password: hashedPassword,
//             role: Role.COMPANY_ADMIN,
//             companyId: retailGlobal.id,
//         }
//     });

//     // 4. Criar Utilizadores Comuns (Staff)
//     const usersData = [
//         { email: 'pedro.santos@innovatech.com', first: 'Pedro', last: 'Santos', compId: techCorp.id },
//         { email: 'marta.oliveira@innovatech.com', first: 'Marta', last: 'Oliveira', compId: techCorp.id },
//         { email: 'rui.costa@retailglobal.pt', first: 'Rui', last: 'Costa', compId: retailGlobal.id },
//         { email: 'sofia.sousa@retailglobal.pt', first: 'Sofia', last: 'Sousa', compId: retailGlobal.id },
//     ];

//     const staffUsers = [];
//     for (const u of usersData) {
//         const user = await prisma.user.create({
//             data: {
//                 email: u.email,
//                 firstName: u.first,
//                 lastName: u.last,
//                 password: hashedPassword,
//                 role: Role.USER,
//                 companyId: u.compId,
//             }
//         });
//         staffUsers.push(user);
//     }

//     // 5. Criar Faturas Realistas
//     const invoiceSpecs = [
//         { desc: 'Licença Software Cloud', val: 560.50, nif: '501234567', status: InvoiceStatus.PAID, user: staffUsers[0], comp: techCorp },
//         { desc: 'Hardware Upgrade - MacBook Pro', val: 2450.00, nif: '501234567', status: InvoiceStatus.PENDING, user: staffUsers[0], comp: techCorp },
//         { desc: 'Consultoria Mensal Fevereiro', val: 1200.00, nif: '508888777', status: InvoiceStatus.PAID, user: staffUsers[1], comp: techCorp },
//         { desc: 'Material de Escritório', val: 125.30, nif: '509999000', status: InvoiceStatus.REJECTED, user: staffUsers[2], comp: retailGlobal },
//         { desc: 'Publicidade Facebook Ads', val: 890.00, nif: '507654321', status: InvoiceStatus.PAID, user: staffUsers[3], comp: retailGlobal },
//         { desc: 'Seguro Frota Automóvel', val: 4500.20, nif: '505555111', status: InvoiceStatus.PENDING, user: staffUsers[2], comp: retailGlobal },
//     ];

//     for (const spec of invoiceSpecs) {
//         await prisma.invoice.create({
//             data: {
//                 description: spec.desc,
//                 value: spec.val,
//                 nif: spec.nif,
//                 status: spec.status,
//                 userId: spec.user.id,
//                 companyId: spec.comp.id,
//                 date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // Últimos 10 dias
//             }
//         });
//     }

//     // 6. Popular Logs de Auditoria para dar "Vida" ao sistema
//     const auditActions = [
//         { user: superAdmin, action: AuditAction.LOGIN, meta: { browser: 'Chrome', ip: '127.0.0.1' } },
//         { user: companyAdmin1, action: AuditAction.REGISTER, meta: { notes: 'Auto-registado pelo sistema' } },
//         { user: staffUsers[0], action: AuditAction.LOGIN, meta: { browser: 'Firefox' } },
//         { user: staffUsers[2], action: AuditAction.PASSWORD_CHANGE, meta: { reason: 'Security cleanup' } },
//     ];

//     for (const log of auditActions) {
//         await prisma.userAuditLog.create({
//             data: {
//                 userId: log.user.id,
//                 action: log.action,
//                 metadata: log.meta,
//                 ipAddr: '192.168.1.10',
//             }
//         });
//     }

//     console.log('Seed terminado com sucesso! 🚀');
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });

import { Role, Status, InvoiceStatus, AuditAction, PermissionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { fakerPT_PT as faker } from '@faker-js/faker';
import prisma from '../src/shared/prisma.service'

// Função auxiliar para escolher items aleatórios de um array
const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

async function main() {
  console.log('🧹 A limpar a base de dados (quebrando relações cíclicas)...');

  // 1. Quebrar a relação cíclica User <-> Company
  await prisma.user.updateMany({ data: { companyId: null } });

  // 2. Apagar de baixo para cima
  await prisma.sharedInvoiceAudit.deleteMany();
  await prisma.sharedInvoice.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.userAuditLog.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();

  console.log('🌱 A gerar dados em massa com Faker.js...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // --- 1. SYSTEM SETTINGS (Apenas 1 registo faz sentido aqui) ---
  await prisma.systemSettings.create({
    data: { id: 1, maintenanceMode: false },
  });

  // --- 2. SUPER ADMIN (Fixo para conseguires entrar) ---
  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Joel',
      lastName: 'Martins',
      email: 'admin@scanify.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      status: Status.ACTIVE,
    },
  });

  // --- 3. COMPANIES & COMPANY ADMINS (Gerar 25 Empresas) ---
  console.log('🏢 A criar 25 Empresas e os seus Administradores...');
  const companies = [];
  const allUsers = [superAdmin];

  for (let i = 0; i < 25; i++) {
    // A. Criar o Admin da Empresa
    const companyAdmin = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: `admin_${i}@${faker.internet.domainName()}`,
        password: hashedPassword,
        role: Role.COMPANY_ADMIN,
        status: faker.helpers.arrayElement([Status.ACTIVE, Status.ACTIVE, Status.SUSPENDED]), // Maioria ativa
      },
    });

    // B. Criar a Empresa (O Admin é o owner)
    const company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        location: faker.location.city(),
        userId: companyAdmin.id,
      },
    });

    // C. Colocar o Admin a trabalhar na própria empresa
    await prisma.user.update({
      where: { id: companyAdmin.id },
      data: { companyId: company.id },
    });

    companies.push(company);
    allUsers.push(companyAdmin);
  }

  // --- 4. USERS COMUNS (Gerar 50 Utilizadores normais) ---
  console.log('👥 A criar 50 Utilizadores e a distribuí-los pelas empresas...');
  const regularUsers = [];

  for (let i = 0; i < 50; i++) {
    const randomCompany = getRandomElement(companies);
    
    const fName = faker.person.firstName();
    const lName = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        firstName: fName,
        lastName: lName,
        email: `colaborador${i}_${faker.internet.email({ firstName: fName, lastName: lName }).toLowerCase()}`, // ✅ 100% Único e realista
        password: hashedPassword,
        role: Role.USER,
        status: Status.ACTIVE,
        companyId: randomCompany.id,
      },
    });
    regularUsers.push(user);
    allUsers.push(user);
  }

  // --- 5. INVOICES (Gerar 100 Faturas realistas) ---
  console.log('🧾 A gerar 100 Faturas...');
  const invoices = [];

  // Garantir que os users que podem ter faturas as recebem
  const usersWithCompanies = allUsers.filter(u => u.companyId !== null);

  for (let i = 0; i < 100; i++) {
    const randomUser = getRandomElement(usersWithCompanies);
    
    const invoice = await prisma.invoice.create({
      data: {
        value: faker.finance.amount({ min: 10, max: 5000, dec: 2 }), // Valores entre 10€ e 5000€
        description: faker.commerce.productName(),
        date: faker.date.recent({ days: 90 }), // Faturas dos últimos 3 meses
        nif: faker.string.numeric(9), // NIF com 9 dígitos
        status: faker.helpers.arrayElement([InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.REJECTED]),
        userId: randomUser.id,
        companyId: randomUser.companyId,
      },
    });
    invoices.push(invoice);
  }

  // --- 6. SHARED INVOICES & AUDITS (Gerar 30 Partilhas) ---
  console.log('🤝 A simular 30 Partilhas de Faturas entre colaboradores...');
  let sharedCount = 0;
  
  // Tentar partilhar faturas dentro da mesma empresa
  for (const invoice of invoices) {
    if (sharedCount >= 30) break;

    // Encontrar outros users da mesma empresa que não sejam o dono da fatura
    const colleagues = allUsers.filter(u => u.companyId === invoice.companyId && u.id !== invoice.userId);
    
    if (colleagues.length > 0) {
      const colleagueToShare = getRandomElement(colleagues);

      // Try/Catch para ignorar falhas caso o Faker tente gerar uma partilha duplicada (@@unique)
      try {
        const sharedInvoice = await prisma.sharedInvoice.create({
          data: {
            userId: colleagueToShare.id, // Quem recebe
            invoiceId: invoice.id,
          },
        });

        // Criar o Audit Log dessa partilha
        await prisma.sharedInvoiceAudit.create({
          data: {
            sharedInvoiceId: sharedInvoice.id,
            fromUserId: invoice.userId,
            toUserId: colleagueToShare.id,
            permissionType: PermissionType.READ,
          },
        });
        sharedCount++;
      } catch (e) {
        // Ignorar duplicados silenciosamente
      }
    }
  }

  // --- 7. USER AUDIT LOGS (Gerar 60 Logs de atividade) ---
  console.log('🔒 A gerar 60 Logs de Auditoria de Sistema...');
  for (let i = 0; i < 60; i++) {
    const randomUser = getRandomElement(allUsers);
    await prisma.userAuditLog.create({
      data: {
        userId: randomUser.id,
        action: faker.helpers.arrayElement([AuditAction.LOGIN, AuditAction.LOGOUT, AuditAction.PROFILE_UPDATE]),
        ipAddr: faker.internet.ipv4(),
        metadata: { browser: 'Chrome', location: faker.location.city() },
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
  }

  // --- 8. PASSWORD RESETS (Gerar 20 Pedidos antigos) ---
  console.log('🔑 A gerar 20 Pedidos de Recuperação de Password expirados...');
  for (let i = 0; i < 20; i++) {
    const randomUser = getRandomElement(allUsers);
    await prisma.passwordReset.create({
      data: {
        userId: randomUser.id,
        token: faker.string.uuid(),
        used: faker.datatype.boolean(),
        expiresAt: faker.date.past(), // Já expirados para simular histórico
      },
    });
  }

  console.log('\n✅ BASE DE DADOS POPULADA COM SUCESSO (Nível Enterprise) ✅');
  console.log('--------------------------------------------------');
  console.log(`📊 Resumo dos Dados Gerados:`);
  console.log(`  - Empresas: 25`);
  console.log(`  - Utilizadores: ${allUsers.length} (1 Super, 25 Admins, 50 Users)`);
  console.log(`  - Faturas: 100`);
  console.log(`  - Partilhas: ${sharedCount}`);
  console.log(`  - Logs de Auditoria: 60`);
  console.log(`  - Resets de Password: 20`);
  console.log('--------------------------------------------------');
  console.log('🔑 Credenciais Fixas para Testes (Password: Password123!)');
  console.log('👨‍💻 Super Admin : admin@scanify.com');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro a popular a base de dados:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });