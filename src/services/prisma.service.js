import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

import { pgAdapterConfig } from '@/helpers/databaseUrl'

// Prisma 7 talks to PostgreSQL through a driver adapter (node-postgres), which
// reads DATABASE_URL differently: pgAdapterConfig keeps the Prisma 6 meaning of
// its parameters (`?schema=`, timeouts, pool size, `sslmode`).
const { poolConfig, options } = pgAdapterConfig(process.env.DATABASE_URL)

const adapter = new PrismaPg(poolConfig, options)

const prisma = new PrismaClient({ adapter })

export { prisma }
