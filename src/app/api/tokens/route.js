import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

/**
 * GET route to retrieve user information and remaining tokens.
 * The remote WordPress plugin can call this API with a valid token
 * to get account information and available credits.
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

		// Verify that userId exists in the token
		if (!payload.userId) {
			return Response.json(
				{ error: 'Malformed token: missing userId' },
				{ status: 400 }
			)
		}

		// Get the token from the database to verify it's valid
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

		// Get user, credits and subscription
		const user = await prisma.user.findFirst({
			include: {
				Subscription: {
					where: {
						// Filter only active subscriptions
						status: 'active',
					},
					orderBy: {
						renewsAt: 'desc', // Get most recent subscription first
					},
					include: {
						plan: true, // Include plan details
					},
					take: 1, // Limit to the most recent subscription
				},
			},
			where: {
				clerkId: payload.userId,
			},
		})

		if (!user) {
			return Response.json({ error: 'User not found' }, { status: 404 })
		}

		// Get additional information from Clerk
		let userDetails = {}
		try {
			// If you need to access Clerk to get first name/last name/email
			// You would need to add the import and call to Clerk API here
			// For example:
			// const clerkUser = await clerkClient.users.getUser(user.clerkId);
			// userDetails = {
			//   firstName: clerkUser.firstName,
			//   lastName: clerkUser.lastName,
			//   email: clerkUser.emailAddresses[0]?.emailAddress
			// };

			// For now, we use what we have via token without calling Clerk
			userDetails = {
				email: payload.email || 'Not available',
				name: tokenRecord.name || 'User',
			}
		} catch (error) {
			console.error('Error while retrieving user details:', error)
		}

		// Determine if user is subscribed
		const hasActiveSubscription =
			user.Subscription && user.Subscription.length > 0
		const subscription = hasActiveSubscription ? user.Subscription[0] : null

		// Return complete information
		return Response.json(
			{
				subscription: {
					isSubscribed: hasActiveSubscription,
					...(subscription && {
						plan: {
							description: subscription.plan.description,
							name: subscription.plan.name,
						},
						statusFormatted: subscription.statusFormatted,
						renewsAt: subscription.renewsAt,
						status: subscription.status,
						endsAt: subscription.endsAt,
					}),
				},
				token: {
					createdAt: tokenRecord.createdAt,
					expiredAt: tokenRecord.expiredAt,
					name: tokenRecord.name,
				},
				user: {
					registeredAt: user.createdAt,
					credits: user.credits,
					id: user.clerkId,
					...userDetails,
				},
				success: true,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error while retrieving information:', error)
		return Response.json(
			{ details: error.message, error: 'Server error' },
			{ status: 500 }
		)
	}
}
