import { auth } from '@clerk/nextjs/server'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUser } from '@/app/actions/app/createUser'
import { deleteToken } from '@/app/actions/tokens/TokensCRUD'
import { chargeOneCredit, findActiveApiToken, getUsageByToken, NoCreditsLeftError } from '@/services/database.service'
import { prisma } from '@/services/prisma.service'
import { processWebhook, saveWebhooks } from '@/services/webhook.service'

if (process.env.FORVOYEZ_INTEGRATION_DATABASE !== 'disposable') {
	throw new Error('Run pnpm test:integration: these tests require their own disposable database')
}

vi.mock('@clerk/nextjs/server')

beforeEach(async () => {
	await prisma.webhookEvent.deleteMany()
	await prisma.subscription.deleteMany()
	await prisma.plan.deleteMany()
	await prisma.usage.deleteMany()
	await prisma.token.deleteMany()
	await prisma.user.deleteMany()
	auth.mockResolvedValue({ userId: 'owner' })
})
afterAll(() => prisma.$disconnect())

describe('real PostgreSQL concurrency and authorization', () => {
	it('installs all dashboard query indexes in PostgreSQL', async () => {
		const indexes = await prisma.$queryRaw`SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
		expect(indexes.map(index => index.indexname)).toEqual(
			expect.arrayContaining([
				'Token_userId_expiredAt_idx',
				'Usage_userId_usedAt_idx',
				'Usage_userId_used_idx',
				'Subscription_userId_status_renewsAt_idx',
			])
		)
	})

	it('creates one user under concurrent first visits without unique-key failures', async () => {
		const users = await Promise.all(Array.from({ length: 12 }, () => createUser()))
		expect(users.every(user => user.clerkId === 'owner')).toBe(true)
		expect(await prisma.user.count()).toBe(1)
	})

	it('spends a single credit once across concurrent requests', async () => {
		await prisma.user.create({ data: { clerkId: 'owner', credits: 1 } })
		const work = vi.fn().mockResolvedValue('generated')
		const results = await Promise.allSettled(
			Array.from({ length: 8 }, () => chargeOneCredit('owner', { reason: 'integration test' }, work))
		)
		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
		const rejected = results.filter(result => result.status === 'rejected')
		expect(rejected.every(result => result.reason instanceof NoCreditsLeftError)).toBe(true)
		expect(work).toHaveBeenCalledTimes(1)
		expect((await prisma.user.findUnique({ where: { clerkId: 'owner' } })).credits).toBe(0)
		expect(await prisma.usage.count()).toBe(1)
	})

	it('refunds failed work and writes no usage entry', async () => {
		await prisma.user.create({ data: { clerkId: 'owner', credits: 1 } })
		await expect(
			chargeOneCredit('owner', { reason: 'integration test' }, () => Promise.reject(new Error('provider unavailable')))
		).rejects.toThrow('provider unavailable')
		expect((await prisma.user.findUnique({ where: { clerkId: 'owner' } })).credits).toBe(1)
		expect(await prisma.usage.count()).toBe(0)
	})

	it('revokes a deleted token and prevents another user from deleting it', async () => {
		await prisma.user.create({ data: { clerkId: 'owner' } })
		const token = await prisma.token.create({
			data: { userId: 'owner', jwt: 'real-db-token', name: 'test', expiredAt: new Date(Date.now() + 60000) },
		})
		expect(await findActiveApiToken(token.jwt, 'other')).toBeNull()
		auth.mockResolvedValue({ userId: 'other' })
		await expect(deleteToken(token.id)).rejects.toThrow('permission')
		expect(await findActiveApiToken(token.jwt, 'owner')).toMatchObject({ id: token.id })
		auth.mockResolvedValue({ userId: 'owner' })
		await deleteToken(token.id)
		expect(await findActiveApiToken(token.jwt, 'owner')).toBeNull()
	})

	it('aggregates reserved JavaScript property names as ordinary token names', async () => {
		await prisma.user.create({ data: { clerkId: 'owner' } })
		await Promise.all(
			['__proto__', 'constructor', 'toString'].map(async name => {
				const token = await prisma.token.create({
					data: { userId: 'owner', jwt: name, name, expiredAt: new Date(Date.now() + 60000) },
				})
				await prisma.usage.create({ data: { userId: 'owner', tokenId: token.id, used: -1 } })
			})
		)
		expect(await getUsageByToken()).toEqual(
			expect.arrayContaining([
				{ token: '__proto__', used: 1 },
				{ token: 'constructor', used: 1 },
				{ token: 'toString', used: 1 },
			])
		)
	})
	it('stores concurrent first webhook deliveries and credits their order only once', async () => {
		await prisma.plan.create({
			data: { name: 'Refill', productId: 'product', variantId: 'pack', price: 100, packageSize: 50 },
		})
		const payload = {
			meta: { event_name: 'order_created', custom_data: { user_id: 'owner' } },
			data: {
				id: 'order-1',
				type: 'orders',
				attributes: { customer_id: 42, status: 'paid', first_order_item: { variant_id: 'pack' } },
			},
		}
		const ids = await Promise.all(Array.from({ length: 6 }, () => saveWebhooks(payload)))
		expect(await Promise.all(ids.map(id => processWebhook(id)))).toEqual(Array(6).fill(true))
		expect((await prisma.user.findUnique({ where: { clerkId: 'owner' } })).credits).toBe(50)
		expect(await prisma.usage.count()).toBe(1)
		expect(await prisma.webhookEvent.count({ where: { processed: true } })).toBe(6)
	})
})
