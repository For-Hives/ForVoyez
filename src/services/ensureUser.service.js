import { prisma } from '@/services/prisma.service'
import 'server-only'

/** Preserve existing user data and recover a competing first insertion. */
export async function ensureUser(create) {
	const where = { clerkId: create.clerkId }
	try {
		return await prisma.user.upsert({ where, update: {}, create })
	} catch (error) {
		if (error.code !== 'P2002') throw error
		const user = await prisma.user.findUnique({ where })
		if (!user) throw error
		return user
	}
}

/**
 * Same guarantee, and says whether this call inserted the row: `created` is
 * true for one call per account, the one that inserted it.
 *
 * It is a single INSERT ... ON CONFLICT DO NOTHING: of several first requests
 * arriving together PostgreSQL lets exactly one insert, the others wait for
 * it, insert nothing and do not fail. A row inserted first by ensureUser (the
 * webhook of a payment) already exists here: `created` is false.
 */
export async function createUserIfMissing(create) {
	const { count } = await prisma.user.createMany({ data: [create], skipDuplicates: true })
	return { created: count === 1 }
}
