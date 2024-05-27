import ClientLogicPlans from '@/app/(dashboard)/app/plans/client'

export const metadata = {
	description:
		"Explore ForVoyez's flexible pricing plans designed to suit your image metadata generation needs and scale with your business.",
	alternates: {
		canonical: '/app/plans',
	},
	title: 'Pricing Plans - ForVoyez',
}

export default function PlansPage() {
	return <ClientLogicPlans />
}
