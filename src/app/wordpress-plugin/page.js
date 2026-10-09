import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { CtaPluginComponent } from '@/components/WordpressPlugin/CtaPlugin.component'
import { FaqPluginComponent } from '@/components/WordpressPlugin/FaqPlugin.component'
import { FeatureHighlightsComponent } from '@/components/WordpressPlugin/FeatureHighlights.component'
import { HeroSectionComponent } from '@/components/WordpressPlugin/HeroSection.component'
import { HowItWorksComponent } from '@/components/WordpressPlugin/HowItWorks.component'
import { TestimonialsComponent } from '@/components/WordpressPlugin/Testimonials.component'

// Fail the build if marketing navigation unexpectedly starts requiring server work.
export const ensureStatic = 'navigation'

export const metadata = {
	openGraph: {
		images: [
			{
				alt: 'ForVoyez WordPress Plugin Interface',
				url: '/og/wordpress-plugin.png',
				width: 1200,
				height: 630,
			},
		],
		description:
			'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',
		title: 'WordPress Plugin - Automate Image Alt Text Generation',
		type: 'website',
	},
	twitter: {
		description:
			'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',
		title: 'ForVoyez WordPress Plugin - AI Alt Text Generator',
		images: '/og/wordpress-plugin.png',
		card: 'summary_large_image',
	},

	keywords: [
		'WordPress plugin',
		'alt text generator',
		'image SEO',
		'accessibility',
		'AI image descriptions',
		'WordPress SEO',
		'image optimization',
		'automated alt text',
		'bulk image processing',
		'website accessibility',
	].join(', '),

	description:
		'Generate alt text, titles, and captions directly in your WordPress media library with ForVoyez. Save time on image descriptions with our AI-powered plugin.',

	alternates: {
		canonical: '/wordpress-plugin',
	},

	title: 'WordPress Plugin - AI Alt Text Generator',

	category: 'WordPress Plugin',
}

export default function WordPressPluginPage() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroSectionComponent />
				<FeatureHighlightsComponent />
				<HowItWorksComponent />
				<TestimonialsComponent />
				<FaqPluginComponent />
				<CtaPluginComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
