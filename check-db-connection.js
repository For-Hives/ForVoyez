const { PrismaClient } = require('@prisma/client')

async function checkDatabaseConnection() {
	const prisma = new PrismaClient()

	try {
		await prisma.$connect()
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
