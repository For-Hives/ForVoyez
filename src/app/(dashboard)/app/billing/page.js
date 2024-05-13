import ClientLogicBilling from '@/app/(dashboard)/app/billing/client'

export const metadata = {
	title: 'Billing - ForVoyez',
	description:
		'Manage your ForVoyez subscription, update payment methods, and view your billing history.',
	alternates: {
		canonical: '/app/billing',
	},
}

export default function BillingPage() {
	return <ClientLogicBilling />
}
