import ClientLogicDashboard from '@/app/(dashboard)/app/client'

export const metadata = {
	description:
		'Access your ForVoyez dashboard to manage your API keys, monitor usage, and explore our powerful image metadata generation capabilities.',
	alternates: {
		canonical: '/app',
	},
	title: 'Dashboard - ForVoyez',
}

export default function WelcomePage() {
	return <ClientLogicDashboard />
}
