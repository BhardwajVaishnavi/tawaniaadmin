import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Configure Prisma client with connection retry logic
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
  })
}

// Use existing Prisma client if available, otherwise create a new one
export const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Add connection event handlers
prisma.$on('error', (e: any) => {
  console.error('Prisma Error:', e)
})

// Save Prisma client to global object in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma