import prisma from '../src/shared/prisma.service'

async function main() {
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log(`Verificação de Dados:`);
    console.log(`- Utilizadores: ${userCount}`);
    console.log(`- Empresas: ${companyCount}`);
    console.log(`- Faturas: ${invoiceCount}`);
    
    if (userCount > 0) {
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('Utilizadores encontrados:', JSON.stringify(users, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
