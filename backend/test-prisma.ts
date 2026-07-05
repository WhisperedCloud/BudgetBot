import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  const users = await prisma.user.findMany();
  console.log('Connected!', users.length, 'users');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
