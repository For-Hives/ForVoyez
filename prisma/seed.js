const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const userData = [
	{
		Token: {
			create: [
				{
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					name: 'Personal Token',
					createdAt: new Date(),
				},
			],
		},
		Usage: {
			create: [
				{
					api: 'GET /api/data',
					usedAt: new Date(),
					used: 5,
				},
			],
		},
		clerkId: 'clerk123',
		credits: 100,
	},
	{
		Token: {
			create: [
				{
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					createdAt: new Date(),
					name: 'Work Token',
				},
			],
		},
		Usage: {
			create: [
				{
					api: 'POST /api/modify',
					usedAt: new Date(),
					used: 10,
				},
			],
		},
		clerkId: 'clerk456',
		credits: 150,
	},
	{
		Token: {
			create: [
				{
					expiredAt: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1)
					),
					name: 'Development Token',
					createdAt: new Date(),
				},
			],
		},
		Usage: {
			create: [
				{
					api: 'DELETE /api/resource',
					usedAt: new Date(),
					used: 20,
				},
			],
		},
		clerkId: 'clerk789',
		credits: 200,
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
