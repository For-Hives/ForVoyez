import ClientLogicPlans from '@/app/(dashboard)/app/plans/client'

export const metadata = {
	title: 'Pricing Plans - ForVoyez',
	description:
		"Explore ForVoyez's flexible pricing plans designed to suit your image metadata generation needs and scale with your business.",
	alternates: {
		canonical: '/app/plans',
	},
}

export default function PlansPage() {
	return <ClientLogicPlans />
}
