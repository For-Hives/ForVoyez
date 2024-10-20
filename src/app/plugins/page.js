import { FeatureHighlightsComponent } from '@/components/Plugins/FeatureHighlights.component'
import { TestimonialsComponent } from '@/components/Plugins/Testimonials.component'
import { HeroSectionComponent } from '@/components/Plugins/HeroSection.component'
import { HowItWorksComponent } from '@/components/Plugins/HowItWorks.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'

export default function WordPressPluginPage() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroSectionComponent />
				<FeatureHighlightsComponent />
				<HowItWorksComponent />
				<TestimonialsComponent />
				{/*todo: <PricingPlugin />*/}
				{/*todo: <FaqPlugin />*/}
				{/*todo: <CtaPlugin />*/}
			</main>
			<FooterComponent />
		</div>
	)
}
