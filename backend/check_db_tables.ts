import prisma from './src/shared/prisma.service';

async function main() {
  console.log("Fetching database tables...");
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ` as any[];
    console.log("Tables in 'public' schema:");
    tables.forEach(t => console.log(` - ${t.table_name}`));
  } catch (err) {
    console.error("Failed to list tables:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
