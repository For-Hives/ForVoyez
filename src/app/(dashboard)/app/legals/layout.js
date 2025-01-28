export const viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#FF6545' },
		{ media: '(prefers-color-scheme: dark)', color: '#FF6545' },
	],
	width: 'device-width',
	initialScale: 1,
}

export const metadata = {
	openGraph: {
		description:
			"Access ForVoyez's terms of service, privacy policy, and other legal documents. Understand our commitment to data protection and user privacy.",
		images: [
			{
				alt: 'ForVoyez Legal Documentation',
				url: '/og/legals.png',
				width: 1200,
				height: 630,
			},
		],
		title: 'Legal Information & Documentation - ForVoyez',
		type: 'website',
	},
	twitter: {
		description:
			'Official legal documentation and policies for ForVoyez image metadata services.',
		title: 'ForVoyez Legal Documentation',
		card: 'summary_large_image',
		images: '/og/legals.png',
	},

	keywords: [
		'ForVoyez legal',
		'terms of service',
		'privacy policy',
		'data protection',
		'user agreement',
		'legal documentation',
		'cookie policy',
		'service terms',
		'user rights',
	].join(', '),

	description:
		"Review ForVoyez's legal documents, including Terms of Service, Privacy Policy, and legal notices. Learn about your rights and our data handling practices.",

	robots: {
		'max-image-preview': 'large',
		'max-video-preview': -1,
		'max-snippet': -1,
		follow: true,
		index: true,
	},

	title: {
		template: '%s | Legal Information - ForVoyez',
		default: 'Legal Information - ForVoyez',
	},

	alternates: {
		canonical: '/app/legals',
	},
}

export default function Layout({ children }) {
	return <>{children}</>
}
