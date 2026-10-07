const { PrismaPg } = require('@prisma/adapter-pg')

const { PrismaClient } = require('./src/generated/prisma/client.ts')

async function checkDatabaseConnection() {
	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
	})

	try {
		await prisma.$connect()
		// with a driver adapter $connect() is lazy: run a query to really connect
		await prisma.$queryRaw`SELECT 1`
		console.info('Connected to the database successfully')
		process.exit(0)
	} catch (error) {
		console.error('Failed to connect to the database:', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

checkDatabaseConnection()
