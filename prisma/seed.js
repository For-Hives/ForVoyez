const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// base data for users
const userData = [
	{
		clerkId: 'user_2f5PvrOEUZJ6gG2M2pSlbi8HHMh',
		customerId: 0,
		credits: 0,
	},
	{
		clerkId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		customerId: 2837049,
		credits: 5980,
	},
]

// plan
const planData = [
	{
		features: `[""100 credits*/month"",""Basic metadata generation"",""Community support"",""Classic image formats (JPEG, PNG, WebP)"",""Full HD image support (up to 1080p)"",""Limited access to playground""]`,
		description:
			'<p>Perfect for small projects, freelancers, and personal use.</p>',
		createAt: new Date('2024-05-14 12:09:59.457'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		billingCycle: 'month',
		variantEnabled: true,
		productId: 262324,
		variantId: 365926,
		mostPopular: true,
		packageSize: 100,
		name: 'Starter',
		price: 390,
		planId: 1,
	},
	{
		features: `["All Starter plan features","1,000 credits*/month","Advanced metadata generation","Priority support","Full access to playground","Ultra HD image support (up to 4K)"]`,
		description:
			'<p>Ideal for growing businesses, automatic tools and advanced users.</p>',
		createAt: new Date('2024-05-14 12:10:01.054'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		billingCycle: 'month',
		variantEnabled: true,
		mostPopular: false,
		productId: 262326,
		variantId: 365931,
		packageSize: 1000,
		name: 'Growth',
		price: 2799,
		planId: 5,
	},
	{
		features: `["120 credits*/month","Basic metadata generation","Community support","Classic image formats (JPEG, PNG, WebP)","Full HD image support (up to 1080p)","Limited access to playground"]`,
		description:
			'<p>Perfect for small projects, freelancers, and personal use.</p>',
		createAt: new Date('2024-05-14 12:10:00.343'),
		productName: 'Credit refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		billingCycle: 'year',
		productId: 262324,
		variantId: 365928,
		packageSize: 1200,
		mostPopular: true,
		name: 'Starter',
		price: 3990,
		planId: 3,
	},
	{
		createAt: new Date('2024-05-20 14:12:14.566'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '115 Credits',
		mostPopular: false,
		productId: 273946,
		variantId: 386222,
		billingCycle: '',
		packageSize: 115,
		description: '',
		features: '[]',
		planId: 5232,
		price: 299,
	},
	{
		createAt: new Date('2024-05-20 14:12:14.915'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '380 Credits',
		mostPopular: false,
		productId: 273946,
		variantId: 386225,
		billingCycle: '',
		packageSize: 380,
		description: '',
		features: '[]',
		planId: 5233,
		price: 999,
	},
	{
		createAt: new Date('2024-05-20 14:12:15.284'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '1140 Credits',
		mostPopular: false,
		productId: 273946,
		variantId: 386226,
		packageSize: 1140,
		billingCycle: '',
		description: '',
		features: '[]',
		planId: 5234,
		price: 2999,
	},
	{
		createAt: new Date('2024-05-20 14:12:16.784'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '100 Credits',
		mostPopular: false,
		productId: 269626,
		variantId: 379035,
		billingCycle: '',
		packageSize: 100,
		description: '',
		features: '[]',
		planId: 5235,
		price: 299,
	},
	{
		createAt: new Date('2024-05-20 14:12:17.178'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '330 Credits',
		mostPopular: false,
		productId: 269626,
		variantId: 379037,
		billingCycle: '',
		packageSize: 330,
		description: '',
		features: '[]',
		planId: 5236,
		price: 999,
	},
	{
		createAt: new Date('2024-05-20 14:12:17.504'),
		productName: 'Credit Refill (Starter)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		name: '1000 Credits',
		mostPopular: false,
		productId: 269626,
		variantId: 379228,
		packageSize: 1000,
		billingCycle: '',
		description: '',
		features: '[]',
		planId: 5237,
		price: 2999,
	},
	{
		features: `["All Starter plan features","1,200 credits*/month","Advanced metadata generation","Priority support","Full access to playground","Ultra HD image support (up to 4K)"]`,
		description:
			'<p>Ideal for growing businesses, automatic tools and advanced users.</p>',
		createAt: new Date('2024-05-14 12:10:01.667'),
		productName: 'Credit refill (Growth)',
		buttonText: 'Subscribe',
		variantEnabled: true,
		billingCycle: 'year',
		packageSize: 12000,
		mostPopular: false,
		productId: 262326,
		variantId: 365932,
		name: 'Growth',
		price: 27990,
		planId: 7,
	},
]

// subscription data
const subscriptionData = [
	{
		renewsAt: new Date('2024-06-20T12:12:28.000Z'),
		endsAt: new Date('2023-05-20T12:48:11.000Z'),
		userId: 'user_2gjNZVkDVIWtaev3UO0Kal4hjGS',
		email: 'andy.cinquin@gmail.com',
		statusFormatted: 'Cancelled',
		lemonSqueezyId: 383422,
		name: 'Andy Cinquin',
		status: 'cancelled',
		isUsageBased: false,
		customerId: 2893681,
		trialEndsAt: null,
		orderId: 2719863,
		isPaused: false,
		oldPlanId: 5,
		planId: 7,
		id: 10,
	},
	{
		renewsAt: new Date('2024-06-28T14:51:52.000Z'),
		userId: 'user_2h6GYOvlTOlyK2w0OaqnyRLf8TW',
		email: 'cinquin.andy@gmail.com',
		statusFormatted: 'Active',
		lemonSqueezyId: 393961,
		name: 'Andy Cinquin',
		isUsageBased: false,
		customerId: 2837049,
		trialEndsAt: null,
		orderId: 2779820,
		status: 'active',
		isPaused: false,
		oldPlanId: null,
		endsAt: null,
		planId: 5,
		id: 11,
	},
]

// token (not need)
// usage
// webhookevent (not needed

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
