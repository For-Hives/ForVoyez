import { FeatureHighlightsComponent } from '@/components/WordpressPlugin/FeatureHighlights.component'
import { TestimonialsComponent } from '@/components/WordpressPlugin/Testimonials.component'
import { HeroSectionComponent } from '@/components/WordpressPlugin/HeroSection.component'
import { HowItWorksComponent } from '@/components/WordpressPlugin/HowItWorks.component'
import { CtaPluginComponent } from '@/components/WordpressPlugin/CtaPlugin.component'
import { FaqPluginComponent } from '@/components/WordpressPlugin/FaqPlugin.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'

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
			'Boost your WordPress SEO with AI-generated alt text. Our free plugin creates high-quality image descriptions automatically.',
		title: 'WordPress Plugin - Automate Image Alt Text Generation',
		type: 'website',
	},
	twitter: {
		description:
			'Transform your WordPress image SEO with AI-powered alt text generation. Free plugin with bulk processing.',
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
		"Enhance your WordPress site's SEO and accessibility with ForVoyez's AI-powered alt text generator. Automatically create high-quality image descriptions for your entire media library.",

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
