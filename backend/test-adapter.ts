import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapterFactory = new PrismaPg(pool);
  
  // Try passing the factory first
  try {
    const prisma = new PrismaClient({ adapter: adapterFactory as any });
    const users = await prisma.user.findMany();
    console.log('Connected with factory!', users.length, 'users');
  } catch(e) {
    console.error('Failed with factory:', e.message);
  }

  // Try calling connect
  try {
    const adapter = await adapterFactory.connect();
    const prisma = new PrismaClient({ adapter });
    const users = await prisma.user.findMany();
    console.log('Connected with adapter!', users.length, 'users');
  } catch(e) {
    console.error('Failed with adapter:', e.message);
  }
}

main().catch(console.error);
