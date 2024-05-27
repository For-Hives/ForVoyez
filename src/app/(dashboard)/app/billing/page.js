import ClientLogicBilling from '@/app/(dashboard)/app/billing/client'

export const metadata = {
	description:
		'Manage your ForVoyez subscription, update payment methods, and view your billing history.',
	alternates: {
		canonical: '/app/billing',
	},
	title: 'Billing - ForVoyez',
}

export default function BillingPage() {
	return <ClientLogicBilling />
}
