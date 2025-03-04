import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

/**
 * GET route to retrieve the number of remaining tokens for a user.
 * The remote WordPress plugin can call this API with a valid token
 * to check the number of available credits.
 */
export async function GET(request) {
	try {
		// Get authentication token from header
		const authHeader = request.headers.get('Authorization')

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return Response.json(
				{ error: 'Missing or invalid authentication token' },
				{ status: 401 }
			)
		}

		const token = authHeader.replace('Bearer ', '')

		// Verify JWT token
		let payload
		try {
			payload = await verifyJwt(token)
		} catch (error) {
			console.error('Token verification error:', error)
			return Response.json(
				{ error: 'Invalid or expired token' },
				{ status: 401 }
			)
		}

		// Check if userId exists in token
		if (!payload.userId) {
			return Response.json(
				{ error: 'Malformed token: missing userId' },
				{ status: 400 }
			)
		}

		// Get token from database to verify it's valid
		const tokenRecord = await prisma.token.findFirst({
			where: {
				expiredAt: {
					gt: new Date(),
				},
				jwt: token,
			},
		})

		if (!tokenRecord) {
			return Response.json(
				{ error: 'Token not found or expired in database' },
				{ status: 401 }
			)
		}

		// Get user and their credits
		const user = await prisma.user.findFirst({
			where: {
				clerkId: payload.userId,
			},
		})

		if (!user) {
			return Response.json({ error: 'User not found' }, { status: 404 })
		}

		// Return remaining credits
		return Response.json({
			user: {
				email: user.email,
				name: user.name,
			},
			credits: user.credits,
			success: true,
		})
	} catch (error) {
		console.error('Error while retrieving tokens:', error)
		return Response.json(
			{ details: error.message, error: 'Server error' },
			{ status: 500 }
		)
	}
}
