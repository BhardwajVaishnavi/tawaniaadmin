import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a custom datasources configuration to use the direct URL
const datasources = {
  db: {
    url: process.env.DIRECT_URL,
  },
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: datasources,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
