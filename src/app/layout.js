import { Jost, Source_Sans_3 } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'

import 'react-toastify/dist/ReactToastify.css'
import '@/styles/globals.css'

const sourcesans = Source_Sans_3({
	weight: ['300', '400', '700', '900'],
	variable: '--font-sourcesans',
	style: ['normal', 'italic'],
	subsets: ['latin'],
})

const jost = Jost({
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	variable: '--font-jost',
	subsets: ['latin'],
	style: ['normal'],
})

export const metadata = {
	openGraph: {
		description:
			'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
		images: [
			{
				url: 'https://forvoyez.com/logo_og.webp',
				width: 1261,
				height: 959,
			},
		],
		title: 'ForVoyez - AI-Powered Image Metadata Generation',
		url: 'https://forvoyez.com/',
		siteName: 'ForVoyez',
		locale: 'en-US',
		type: 'website',
	},
	twitter: {
		description:
			'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
		images: [
			{
				url: 'https://forvoyez.com/logo_og.webp',
				width: 1261,
				height: 959,
			},
		],
		title: 'ForVoyez - AI-Powered Image Metadata Generation',
		card: 'summary_large_image',
		creator: '@ForVoyez',
	},
	robots: {
		googleBot: {
			'max-image-preview': 'large',
			'max-video-preview': -1,
			noimageindex: true,
			'max-snippet': -1,
			follow: true,
			index: true,
		},
		nocache: true,
		follow: true,
		index: true,
	},
	description:
		'ForVoyez is a powerful SaaS platform that automatically generates SEO-optimized alternative text, titles, and captions for your images using advanced AI technology.',
	alternates: {
		languages: {
			'en-US': 'https://forvoyez.com/',
		},
		canonical: 'https://forvoyez.com/',
	},
	keywords: 'ForVoyez, image metadata, alt text, SEO, AI, SaaS, API',
	authors: [{ url: 'https://forvoyez.com', name: 'ForVoyez Team' }],
	title: 'ForVoyez - AI-Powered Image Metadata Generation',
	metadataBase: new URL('https://forvoyez.com/'),
	publisher: 'ForVoyez',
	creator: 'ForVoyez',
}

export default function RootLayout({ children }) {
	return (
		<ClerkProvider>
			<html className={`${sourcesans.variable} ${jost.variable}`} lang={'en'}>
				<Script
					async
					data-domains={'forvoyez.com,doc.forvoyez.com'}
					data-website-id="705a7c53-7dc4-4cf7-b625-f2f87a428bfb"
					src="https://umami.wadefade.fr/script.js"
					strategy="afterInteractive"
				></Script>
				<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
					{children}
				</body>
			</html>
		</ClerkProvider>
	)
}
