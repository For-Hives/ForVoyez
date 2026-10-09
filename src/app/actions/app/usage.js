'use server'

import { requireUserId } from '@/services/auth.service'
import { getCreditsFromUserId, getUsageByToken, getUsageForUser } from '@/services/database.service'

export async function getMyCredits() {
	await requireUserId()
	return getCreditsFromUserId()
}

export async function getMyUsage() {
	await requireUserId()
	return getUsageForUser()
}

export async function getMyUsageByToken() {
	await requireUserId()
	return getUsageByToken()
}
