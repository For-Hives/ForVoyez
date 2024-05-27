import ClientLogicLegals from '@/app/(dashboard)/app/legals/client'

export const metadata = {
	description:
		'Access the legal information for ForVoyez, including our legal notice, privacy policy, and terms of service.',
	alternates: {
		canonical: '/app/legal',
	},
	title: 'Legal - ForVoyez',
}

export default function LegalsPage() {
	return <ClientLogicLegals />
}
