import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding demo data...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@budgetbot.com' },
    update: {},
    create: {
      email: 'demo@budgetbot.com',
      password: passwordHash,
      name: 'Demo Account',
    },
  });

  console.log(`Created demo user: ${demoUser.email} / demo123`);

  // Clear existing demo data just in case
  await prisma.expense.deleteMany({ where: { userId: demoUser.id } });
  await prisma.budget.deleteMany({ where: { userId: demoUser.id } });

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // 2. Create Budgets
  const budgets = await Promise.all([
    prisma.budget.create({ data: { userId: demoUser.id, category: 'Food & Dining', amount: 800, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: demoUser.id, category: 'Transportation', amount: 300, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: demoUser.id, category: 'Entertainment', amount: 250, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: demoUser.id, category: 'Shopping', amount: 500, month: currentMonth, year: currentYear } }),
    prisma.budget.create({ data: { userId: demoUser.id, category: 'Housing', amount: 2000, month: currentMonth, year: currentYear } }),
  ]);
  
  console.log(`Created ${budgets.length} budgets.`);

  
  const expensesToCreate = [
    { description: 'Whole Foods Market', amount: 125.50, category: 'Food & Dining', date: new Date(today.getTime() - 1 * 86400000) },
    { description: 'Uber to Airport', amount: 45.00, category: 'Transportation', date: new Date(today.getTime() - 2 * 86400000) },
    { description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: new Date(today.getTime() - 3 * 86400000) },
    { description: 'Amazon Purchases', amount: 89.90, category: 'Shopping', date: new Date(today.getTime() - 4 * 86400000) },
    { description: 'Monthly Rent', amount: 2000.00, category: 'Housing', date: new Date(today.getTime() - 5 * 86400000) },
    { description: 'Starbucks Coffee', amount: 6.50, category: 'Food & Dining', date: new Date(today.getTime() - 0 * 86400000) },
    { description: 'Movie Tickets', amount: 32.00, category: 'Entertainment', date: new Date(today.getTime() - 1 * 86400000) },
    { description: 'Gas Station', amount: 40.00, category: 'Transportation', date: new Date(today.getTime() - 3 * 86400000) },
  ];

  for (const exp of expensesToCreate) {
    await prisma.expense.create({
      data: {
        userId: demoUser.id,
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: exp.date,
      }
    });
  }

  console.log(`Created ${expensesToCreate.length} transactions.`);
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
