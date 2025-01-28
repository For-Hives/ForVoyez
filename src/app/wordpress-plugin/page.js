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
		description:
			'Boost your WordPress SEO with AI-generated alt text. Our free plugin automatically creates high-quality image descriptions, improving accessibility and search rankings.',
		images: [
			{
				url: '/images/plugins/forvoyez_wordpress.png',
				alt: 'ForVoyez WordPress Plugin Interface',
				width: 1200,
				height: 630,
			},
		],
		title: 'ForVoyez WordPress Plugin - Automate Image Alt Text Generation',
		url: 'https://forvoyez.com/wordpress-plugin',
		siteName: 'ForVoyez',
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		description:
			'Transform your WordPress image SEO with AI-powered alt text generation. Free plugin with bulk processing and multi-language support.',
		images: ['/images/wordpress-plugin/forvoyez_wordpress.png'],
		title: 'ForVoyez - AI Alt Text Generator for WordPress',
		card: 'summary_large_image',
		creator: '@ForVoyez',
		site: '@ForVoyez',
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
	],
	description:
		"Enhance your WordPress site's SEO and accessibility with ForVoyez's AI-powered alt text generator. Automatically create high-quality image descriptions, titles, and captions for your entire media library.",
	alternates: {
		languages: {
			'en-US': 'https://forvoyez.com/wordpress-plugin',
		},
		canonical: 'https://forvoyez.com/wordpress-plugin',
	},
	robots: {
		'max-image-preview': 'large',
		'max-video-preview': -1,
		'max-snippet': -1,
		follow: true,
		index: true,
	},
	title: 'ForVoyez WordPress Plugin - AI-Powered Image Alt Text Generator',
	viewport: 'width=device-width, initial-scale=1',
	category: 'WordPress WordpressPlugin',
	themeColor: '#FF9776',
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
