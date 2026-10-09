import 'react-toastify/dist/ReactToastify.css'

import { ClerkProvider } from '@clerk/nextjs'
import { Jost, Source_Sans_3 } from 'next/font/google'
import Script from 'next/script'
import { ViewTransition } from 'react'

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

export const viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#FF6545' },
		{ media: '(prefers-color-scheme: dark)', color: '#FF6545' },
	],
	width: 'device-width',
	colorScheme: 'light',
	initialScale: 1,
}

export const metadata = {
	openGraph: {
		description:
			'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',
		images: [
			{
				url: 'https://forvoyez.com/logo/forvoyez_og.png',
				width: 1261,
				height: 959,
			},
		],
		title: 'ForVoyez - AI Alt Text for WordPress Images',
		url: 'https://forvoyez.com/',
		siteName: 'ForVoyez',
		locale: 'en-US',
		type: 'website',
	},
	twitter: {
		description:
			'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',
		images: [
			{
				url: 'https://forvoyez.com/logo/forvoyez_og.png',
				width: 1261,
				height: 959,
			},
		],
		title: 'ForVoyez - AI Alt Text for WordPress Images',
		card: 'summary_large_image',
		creator: '@ForVoyez',
	},
	icons: {
		icon: [
			{ url: '/favicon.ico' },
			{ url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
			{ type: 'image/svg+xml', url: '/favicon.svg' },
		],
		apple: {
			url: '/apple-touch-icon.png',
			type: 'image/png',
			sizes: '180x180',
		},
		shortcut: '/favicon.ico',
	},

	robots: {
		googleBot: {
			'max-image-preview': 'large',
			'max-video-preview': -1,
			noimageindex: false,
			'max-snippet': -1,
			follow: true,
			index: true,
		},
		nocache: true,
		follow: true,
		index: true,
	},

	description:
		'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',
	alternates: {
		languages: {
			'en-US': 'https://forvoyez.com/',
		},
		canonical: 'https://forvoyez.com/',
	},
	title: {
		default: 'ForVoyez - AI Alt Text for WordPress Images',
		template: '%s | ForVoyez',
	},
	appleWebApp: {
		statusBarStyle: 'default',
		title: 'ForVoyez',
		capable: true,
	},
	keywords: 'ForVoyez, WordPress plugin, image alt text, media library, image accessibility, image SEO',
	authors: [{ url: 'https://forvoyez.com', name: 'ForVoyez Team' }],
	metadataBase: new URL('https://forvoyez.com/'),
	manifest: '/site.webmanifest',
	publisher: 'ForVoyez',
	creator: 'ForVoyez',
}

export default function RootLayout({ children }) {
	return (
		<ClerkProvider
			afterSignOutUrl="/"
			// Clerk Core 3 hides optional sign-up fields by default; keep showing them
			appearance={{ options: { showOptionalFields: true } }}
		>
			<html className={`${sourcesans.variable} ${jost.variable}`} data-scroll-behavior="smooth" lang={'en'}>
				<Script
					async
					data-domains={'forvoyez.com,doc.forvoyez.com'}
					data-website-id="705a7c53-7dc4-4cf7-b625-f2f87a428bfb"
					src="https://umami.wadefade.fr/script.js"
					strategy="afterInteractive"
				></Script>
				<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
					<ViewTransition default="none" update="fv-page">
						{children}
					</ViewTransition>
				</body>
			</html>
		</ClerkProvider>
	)
}
