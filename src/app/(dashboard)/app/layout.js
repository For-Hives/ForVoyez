import { LayoutAppComponent } from '@/components/App/LayoutApp.component' // app/(dashboard)/app/layout.js

// app/(dashboard)/app/layout.js
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
		images: [
			{
				alt: 'ForVoyez Account Dashboard',
				url: '/og/dashboard.png',
				width: 1200,
				height: 630,
			},
		],
		description: 'Connect your WordPress plugin, manage your credits and plan, and review your image generation usage.',
		title: 'Your ForVoyez Account',
		type: 'website',
	},
	keywords: [
		'account dashboard',
		'API management',
		'usage monitoring',
		'API keys',
		'image metadata',
		'WordPress plugin',
		'ForVoyez platform',
		'API analytics',
		'image descriptions',
	].join(', '),

	description:
		'Manage your WordPress plugin connection, image generation credits, and subscription from your ForVoyez account.',

	robots: {
		'max-snippet': -1,
		nofollow: true,
		follow: false,
		noindex: true,
		index: false,
	},

	title: {
		default: 'Your Account - ForVoyez',
		template: '%s | ForVoyez Dashboard',
	},

	alternates: {
		canonical: '/app',
	},
}

// biome-ignore lint/suspicious/useAwait: Keep the existing async contract and promise rejection behavior.
export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="h-full w-full">
				<LayoutAppComponent>{children}</LayoutAppComponent>
			</div>
		</div>
	)
}
