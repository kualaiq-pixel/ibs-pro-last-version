import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const envUrl = process.env.DATABASE_URL || ''
const isPostgres = envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://')

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(isPostgres ? {} : {
      datasources: {
        db: {
          url: 'postgresql://postgres.zrddjzisqrpajeqrrezz:May1921Sul%40%40102030@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
        }
      }
    }),
    log: [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
