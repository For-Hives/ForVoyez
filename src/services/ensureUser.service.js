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
