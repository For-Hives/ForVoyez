const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// user data
const userData = [
	{
		createdAt: new Date('2024-06-09 18:07:57.199'),
		updatedAt: new Date('2024-06-09 18:07:57.198'),
		clerkId: 'user_2f5PvrOEUZJ6gG2M2pSlbi8HHMh',
		customerId: 0,
		credits: 0,
	},
	{
		createdAt: new Date('2024-05-28 14:39:24.773'),
		updatedAt: new Date('2024-06-10 12:34:55.015'),
		clerkId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		customerId: 2837049,
		credits: 5980,
	},
]

// plan
const planData = [
	{
		features: `["100 credits*/month","Basic metadata generation","Community support","Classic image formats (JPEG, PNG, WebP)","Full HD image support (up to 1080p)","Limited access to playground"]`,
		description:
			'<p>Perfect for small projects, freelancers, and personal use.</p>',
		createdAt: new Date('2024-05-14 12:09:59.457'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		billingCycle: 'month',
		variantEnabled: true,
		productId: '262324',
		variantId: '365926',
		mostPopular: true,
		packageSize: 100,
		name: 'Starter',
		price: 390,
		id: 1,
	},
	{
		features: `["All Starter plan features","1,000 credits*/month","Advanced metadata generation","Priority support","Full access to playground","Ultra HD image support (up to 4K)"]`,
		description:
			'<p>Ideal for growing businesses, automatic tools and advanced users.</p>',
		createdAt: new Date('2024-05-14 12:10:01.054'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		billingCycle: 'month',
		variantEnabled: true,
		productId: '262324',
		variantId: '365931',
		mostPopular: false,
		packageSize: 1000,
		name: 'Growth',
		price: 2799,
		id: 5,
	},
	{
		features: `["120 credits*/month","Basic metadata generation","Community support","Classic image formats (JPEG, PNG, WebP)","Full HD image support (up to 1080p)","Limited access to playground"]`,
		description:
			'<p>Perfect for small projects, freelancers, and personal use.</p>',
		createdAt: new Date('2024-05-14 12:10:00.343'),
		productName: 'Credit refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		billingCycle: 'year',
		productId: '262324',
		variantId: '365928',
		packageSize: 1200,
		mostPopular: true,
		name: 'Starter',
		price: 3990,
		id: 3,
	},
	{
		createdAt: new Date('2024-05-20 14:12:14.566'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '115 Credits',
		productId: '273946',
		variantId: '386222',
		mostPopular: false,
		billingCycle: '',
		packageSize: 115,
		description: '',
		features: '[]',
		price: 299,
		id: 5232,
	},
	{
		createdAt: new Date('2024-05-20 14:12:14.915'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '380 Credits',
		productId: '273946',
		variantId: '386225',
		mostPopular: false,
		billingCycle: '',
		packageSize: 380,
		description: '',
		features: '[]',
		price: 999,
		id: 5233,
	},
	{
		createdAt: new Date('2024-05-20 14:12:15.284'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '1140 Credits',
		productId: '273946',
		variantId: '386226',
		mostPopular: false,
		packageSize: 1140,
		billingCycle: '',
		description: '',
		features: '[]',
		price: 2999,
		id: 5234,
	},
	{
		createdAt: new Date('2024-05-20 14:12:16.784'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '100 Credits',
		productId: '269626',
		variantId: '379035',
		mostPopular: false,
		billingCycle: '',
		packageSize: 100,
		description: '',
		features: '[]',
		price: 299,
		id: 5235,
	},
	{
		createdAt: new Date('2024-05-20 14:12:17.178'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '330 Credits',
		productId: '269626',
		variantId: '379037',
		mostPopular: false,
		billingCycle: '',
		packageSize: 330,
		description: '',
		features: '[]',
		price: 999,
		id: 5236,
	},
	{
		createdAt: new Date('2024-05-20 14:12:17.504'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '1000 Credits',
		productId: '269626',
		variantId: '379228',
		mostPopular: false,
		packageSize: 1000,
		billingCycle: '',
		description: '',
		features: '[]',
		price: 2999,
		id: 5237,
	},
	{
		features: `["All Starter plan features","1,200 credits*/month","Advanced metadata generation","Priority support","Full access to playground","Ultra HD image support (up to 4K)"]`,
		description:
			'<p>Ideal for growing businesses, automatic tools and advanced users.</p>',
		createdAt: new Date('2024-05-14 12:10:01.667'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		billingCycle: 'year',
		productId: '262326',
		variantId: '365932',
		packageSize: 12000,
		mostPopular: false,
		name: 'Growth',
		price: 27990,
		id: 7,
	},
]

// subscription dataz
const subscriptionData = [
	{
		renewsAt: new Date('2024-06-20 12:12:28.000').toISOString(),
		endsAt: new Date('2023-05-20 12:48:11.000').toISOString(),
		userId: 'user_2f5PvrOEUZJ6gG2M2pSlbi8HHMh',
		email: 'andy.cinquin@gmail.com',
		statusFormatted: 'Cancelled',
		lemonSqueezyId: '383422',
		customerId: '2893681',
		name: 'Andy Cinquin',
		status: 'cancelled',
		isUsageBased: false,
		orderId: 2719863,
		isPaused: false,
		oldPlanId: 5,
		planId: 7,
		id: 10,
	},
	{
		renewsAt: new Date('2024-06-28 14:51:52.000').toISOString(),
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		email: 'cinquin.andy@gmail.com',
		statusFormatted: 'Active',
		lemonSqueezyId: '393961',
		customerId: '2837049',
		name: 'Andy Cinquin',
		isUsageBased: false,
		orderId: 2779820,
		status: 'active',
		isPaused: false,
		planId: 5,
		id: 11,
	},
]

,5990
,5993
,5995
,5988
,5984
,5983
,5987
,3997
,5982
,4996
,3991
,5989
,5994
,5986
,1999
,4992
,2998
,5981
,5985

// token (not need)
// usage data
const usageData = [
	{
		usedAt: new Date('2024-06-03 18:41:18.304'),
		id: '5e5615c2-aa0b-4d1c-98bb-cd2ad36145d7',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5989,
		previousCredits: 5990
	},
	{
		usedAt: new Date('2024-06-03 19:15:26.938'),
		id: '39bee856-5f74-4f57-9f89-96c25abffb69',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5992,
		previousCredits: 5993
	},
	{
		usedAt: new Date('2024-06-03 19:17:39.750'),
		id: '6d27e371-04b9-4259-832a-91d301a6cba9',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5994,
		previousCredits: 5995
	},
	{
		usedAt: new Date('2024-06-04 07:53:34.634'),
		id: '387e0259-d360-4827-b21c-c6a2a4dc6dac',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5987,
		previousCredits: 5988
	},
	{
		usedAt: new Date('2024-06-04 09:05:33.478'),
		id: 'e75bbb67-4a77-400f-81cf-4330ad080cb4',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5983,
		previousCredits: 5984
	},
	{
		usedAt: new Date('2024-06-04 09:21:54.728'),
		id: '9caebdf9-d179-4c98-b7d8-49f555ccea5a',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5982,
		previousCredits: 5983
	},
	{
		usedAt: new Date('2024-06-04 09:29:41.551'),
		id: '34a59344-ffaf-4245-ae05-33065bf0f850',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5986,
		previousCredits: 5987
	},
	{
		usedAt: new Date('2024-06-04 09:32:59.326'),
		id: '76d927a8-8597-4c20-b054-2e2ccd306bc5',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5997,
		previousCredits: 3997
	},
	{
		usedAt: new Date('2024-06-10 12:32:42.255'),
		id: '8fa6b530-9530-495a-9af5-b424464c13b4',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5981,
		previousCredits: 5982
	},
	{
		usedAt: new Date('2024-06-10 12:34:55.050'),
		id: 'c3885879-0a55-4ad3-83b2-3d712cfa6028',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5995,
		previousCredits: 4996
	},
	{
		usedAt: new Date('2024-06-01 15:19:00.943'),
		id: 'c769c272-7ef7-4c64-b18a-b77399b4cf1a',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5990,
		previousCredits: 3991
	},
	{
		usedAt: new Date('2024-05-07 15:19:00.943'),
		id: '49bbb203-5fca-4561-97cc-e5f48764a437',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5988,
		previousCredits: 5989
	},
	{
		usedAt: new Date('2024-05-24 15:19:00.943'),
		id: '5b9a56e4-d213-4623-96ae-a8535f1403bd',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5993,
		previousCredits: 5994
	},
	{
		usedAt: new Date('2024-06-03 18:32:32.839'),
		id: '2a358a01-3bd3-4968-a70d-13b02eea1215',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5985,
		previousCredits: 5986
	},
	{
		usedAt: new Date('2024-05-03 15:19:00.943'),
		id: '4b2e182d-abb8-4aea-93a2-d3f61e7ececd',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5999,
		previousCredits: 1999
	},
	{
		usedAt: new Date('2024-05-02 15:19:00.943'),
		id: '64772419-1136-40f3-9a45-dd6c09e3e867',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5991,
		previousCredits: 4992
	},
	{
		usedAt: new Date('2024-06-02 18:32:07.703'),
		id: 'dae73eac-fb1f-48d9-82d3-58026377869e',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5998,
		previousCredits: 2998
	},
	{
		usedAt: new Date('2024-05-06 15:19:00.943'),
		id: 'f64f1288-459b-4847-be30-a03161cd7e11',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5980,
		previousCredits: 5981
	},
	{
		usedAt: new Date('2024-05-01 15:19:00.943'),
		id: '4cf7167f-52f9-4680-96c4-251e8380a620',
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		reason: 'describe from PlaygroundAction',
		api: 'describe',
		used: -1,
		currentCredits: 5984,
		previousCredits: 5985
	},
]

// webhookevent (not needed

async function main() {
	for (const u of userData) {
		const user = await prisma.user.create({
			data: u,
		})
		console.info(`Created user with id: ${user.clerkId}`)
	}

	for (const p of planData) {
		const plan = await prisma.plan.create({
			data: p,
		})
		console.info(`Created plan with id: ${plan.id}`)
	}

	for (const s of subscriptionData) {
		const subscription = await prisma.subscription.create({
			data: s,
		})
		console.info(`Created subscription with id: ${subscription.id}`)
	}

	for (const u of usageData) {
		const usage = await prisma.usage.create({
			data: u,
		})
		console.info(`Created usage with id: ${usage.id}`)
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
