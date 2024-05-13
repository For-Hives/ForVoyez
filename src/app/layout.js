import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

import { ClerkProvider } from '@clerk/nextjs'
import { Jost, Source_Sans_3 } from 'next/font/google'

const sourcesans = Source_Sans_3({
	weight: ['300', '400', '700', '900'],
	subsets: ['latin'],
	variable: '--font-sourcesans',
	style: ['normal', 'italic'],
})

const jost = Jost({
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	subsets: ['latin'],
	variable: '--font-jost',
	style: ['normal'],
})

export const metadata = {
	title: 'ForVoyez - AI-Powered Image Metadata Generation',
	description:
		'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
	keywords: 'ForVoyez, image metadata, alt text, SEO, AI, SaaS, API',
	authors: [{ name: 'ForVoyez Team', url: 'https://forvoyez.com' }],
	creator: 'ForVoyez',
	publisher: 'ForVoyez',
	metadataBase: new URL('https://forvoyez.com/'),
	openGraph: {
		title: 'ForVoyez - AI-Powered Image Metadata Generation',
		description:
			'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
		url: 'https://forvoyez.com/',
		siteName: 'ForVoyez',
		images: [
			{
				url: 'https://forvoyez.com/logo_og.webp',
				width: 1261,
				height: 959,
			},
		],
		locale: 'en-US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'ForVoyez - AI-Powered Image Metadata Generation',
		description:
			'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
		creator: '@ForVoyez',
		images: [
			{
				url: 'https://forvoyez.com/logo_og.webp',
				width: 1261,
				height: 959,
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	alternates: {
		canonical: 'https://forvoyez.com/',
		languages: {
			'en-US': 'https://forvoyez.com/',
		},
	},
}

export default function RootLayout({ children }) {
	return (
		<ClerkProvider>
			<html className={`${sourcesans.variable} ${jost.variable}`} lang={'en'}>
				<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
					{children}
				</body>
			</html>
		</ClerkProvider>
	)
}
