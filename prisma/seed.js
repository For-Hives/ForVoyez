const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const userData = [
	{
		clerkId: 'clerk123',
		credits: 100,
		Token: {
			create: [
				{
					createdAt: new Date(),
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					name: 'Personal Token',
				},
			],
		},
		Usage: {
			create: [
				{
					usedAt: new Date(),
					used: 5,
					api: 'GET /api/data',
				},
			],
		},
	},
	{
		clerkId: 'clerk456',
		credits: 150,
		Token: {
			create: [
				{
					createdAt: new Date(),
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					name: 'Work Token',
				},
			],
		},
		Usage: {
			create: [
				{
					usedAt: new Date(),
					used: 10,
					api: 'POST /api/modify',
				},
			],
		},
	},
	{
		clerkId: 'clerk789',
		credits: 200,
		Token: {
			create: [
				{
					createdAt: new Date(),
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					name: 'Development Token',
				},
			],
		},
		Usage: {
			create: [
				{
					usedAt: new Date(),
					used: 20,
					api: 'DELETE /api/resource',
				},
			],
		},
	},
]

async function main() {
	for (const u of userData) {
		const user = await prisma.user.create({
			data: u,
		})
		console.info(`Created user with id: ${user.id}`)
	}
	console.info(`Seeding finished.`)
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
