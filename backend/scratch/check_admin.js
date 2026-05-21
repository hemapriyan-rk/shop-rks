const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'admin' }
  });
  console.log('Admin User:', user);
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  console.log('System Config:', config);
}

main().catch(console.error).finally(() => prisma.$disconnect());
