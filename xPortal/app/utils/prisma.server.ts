// app/utils/prisma.server.ts
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient
declare global {
  var __db: PrismaClient | undefined
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ['error', 'warn'],
    })
  }
  prisma = global.__db
}

// Ensure the database is connected
const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('Successfully connected to database')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    process.exit(1)
  }
}

connectDB()

export { prisma }
