import ClientLogicLegals from '@/app/(dashboard)/app/legals/client'

export const metadata = {
	title: 'Legal - ForVoyez',
	description:
		'Access the legal information for ForVoyez, including our legal notice, privacy policy, and terms of service.',
	alternates: {
		canonical: '/app/legal',
	},
}

export default function LegalsPage() {
	return <ClientLogicLegals />
}
