const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Try to connect to the database
  try {
    await prisma.$connect();
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 