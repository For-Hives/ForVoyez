import { ToastContainer } from 'react-toastify'

import { ContactComponent } from '@/components/Contact/Contact.component'
import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	openGraph: {
		description:
			"Get in touch with our team for support, partnerships, or inquiries about ForVoyez's AI-powered image metadata generation services.",
		images: [
			{
				alt: 'Contact ForVoyez Team',
				url: '/og/contact.png',
				width: 1200,
				height: 630,
			},
		],
		title: 'Contact ForVoyez - AI Image Metadata Solutions',
	},
	twitter: {
		description:
			'Reach out to ForVoyez for technical support and partnership opportunities.',
		title: 'Contact ForVoyez Support Team',
		card: 'summary_large_image',
		images: '/og/contact.png',
	},

	keywords: [
		'ForVoyez contact',
		'technical support',
		'partnership inquiries',
		'AI support',
		'image metadata help',
		'SEO consultation',
		'customer service',
		'business inquiries',
	].join(', '),

	description:
		'Connect with ForVoyez for technical support, partnership opportunities, or inquiries about our AI-powered image metadata services. Our team is here to help you optimize your image SEO.',

	robots: {
		'max-image-preview': 'large',
		'max-video-preview': -1,
		'max-snippet': -1,
		follow: true,
		index: true,
	},

	title: 'Contact Us - Get Support & Partnership Inquiries | ForVoyez',

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
