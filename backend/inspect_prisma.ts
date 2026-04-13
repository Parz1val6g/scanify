import prisma from './src/shared/prisma.service';

async function main() {
  console.log("Prisma Models found in client:");
  const keys = Object.keys(prisma);
  const models = keys.filter(k => typeof (prisma as any)[k] === 'object' && !k.startsWith('$'));
  console.log(models);
  
  if ((prisma as any).systemSettings) {
    console.log("systemSettings model found!");
  } else {
    console.log("systemSettings model NOT found.");
  }
}

main().catch(console.error);
