import { prisma } from './db'

// Verify database connection on startup
async function verifyDatabaseConnection() {
  try {
    // Try a simple query to check connection
    await prisma.$queryRaw`SELECT 1 as result`
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

// Run the verification in development mode
if (process.env.NODE_ENV === 'development') {
  verifyDatabaseConnection()
}

export { prisma }
