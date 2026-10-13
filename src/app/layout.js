import 'react-toastify/dist/ReactToastify.css'

import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import { ViewTransition } from 'react'
import { preload } from 'react-dom'
import { AnalyticsEventsComponent } from '@/components/Analytics/AnalyticsEvents.component'

import { UMAMI_WEBSITE_ID } from '@/constants/umami'

import '@/styles/fonts.css'
import '@/styles/globals.css'

// The latin files of the two fonts (src/styles/fonts.css), which every page
// uses: preloaded like next/font did, the other subsets load on demand.
const PRELOADED_FONTS = [
	'/fonts/source-sans-3-v20-latin-normal.woff2',
	'/fonts/source-sans-3-v20-latin-italic.woff2',
	'/fonts/jost-v20-latin-normal.woff2',
]

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
	for (const href of PRELOADED_FONTS) {
		preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
	}

	return (
		<ClerkProvider
			afterSignOutUrl="/"
			// Clerk Core 3 hides optional sign-up fields by default; keep showing them
			appearance={{ options: { showOptionalFields: true } }}
		>
			<html data-scroll-behavior="smooth" lang={'en'}>
				{/* the tracker ignores every host missing from data-domains (the docs load the same tag) */}
				<Script
					async
					data-domains={'forvoyez.com,doc.forvoyez.com,docs.forvoyez.com'}
					data-website-id={UMAMI_WEBSITE_ID}
					src="https://umami.wadefade.fr/script.js"
					strategy="afterInteractive"
				></Script>
				<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
					<AnalyticsEventsComponent />
					<ViewTransition default="none" update="fv-page">
						{children}
					</ViewTransition>
				</body>
			</html>
		</ClerkProvider>
	)
}
