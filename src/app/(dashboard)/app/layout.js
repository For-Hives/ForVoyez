import { LayoutAppComponent } from '@/components/App/LayoutApp.component'

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
				alt: 'ForVoyez Developer Dashboard Interface',
				url: '/og/dashboard.png',
				width: 1200,
				height: 630,
			},
		],
		description:
			'Access powerful image metadata generation tools, manage API keys, and monitor usage all in one place.',
		title: 'ForVoyez Developer Platform',
		type: 'website',
	},
	keywords: [
		'developer dashboard',
		'API management',
		'usage monitoring',
		'API keys',
		'image metadata',
		'developer tools',
		'ForVoyez platform',
		'API analytics',
		'developer console',
	].join(', '),

	description:
		'Manage your ForVoyez API integration, monitor usage metrics, and access our powerful image metadata generation tools in one central dashboard.',

	robots: {
		'max-snippet': -1,
		nofollow: true,
		follow: false,
		noindex: true,
		index: false,
	},

	title: {
		default: 'Developer Dashboard - ForVoyez',
		template: '%s | ForVoyez Dashboard',
	},

	alternates: {
		canonical: '/app',
	},
}

export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="h-full w-full">
				<LayoutAppComponent>{children}</LayoutAppComponent>
			</div>
		</div>
	)
}
