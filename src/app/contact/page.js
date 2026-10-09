import { ToastContainer } from 'react-toastify'

import { ContactComponent } from '@/components/Contact/Contact.component'
import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'

// Fail the build if marketing navigation unexpectedly starts requiring server work.
export const ensureStatic = 'navigation'

export const metadata = {
	openGraph: {
		description:
			'Need help with the ForVoyez WordPress plugin? Contact us about installation, your account, credits, or image descriptions.',
		images: [
			{
				alt: 'Contact ForVoyez Team',
				url: '/og/contact.png',
				width: 1200,
				height: 630,
			},
		],
		title: 'Get Help with the ForVoyez WordPress Plugin',
	},
	twitter: {
		description: 'Get help installing and using the ForVoyez WordPress plugin.',
		title: 'Contact ForVoyez Support Team',
		card: 'summary_large_image',
		images: '/og/contact.png',
	},

	keywords: [
		'ForVoyez contact',
		'WordPress plugin support',
		'plugin installation',
		'AI support',
		'image description help',
		'ForVoyez credits',
		'customer service',
		'business inquiries',
	].join(', '),

	description:
		'Contact ForVoyez for help with the WordPress plugin, connecting your account, credits, and generating image descriptions.',

	robots: {
		'max-image-preview': 'large',
		'max-video-preview': -1,
		'max-snippet': -1,
		follow: true,
		index: true,
	},

	title: 'WordPress Plugin Support',

	alternates: {
		canonical: '/contact',
	},
}

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ToastContainer className={'z-50'} closeOnClick />
				<ContactComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
