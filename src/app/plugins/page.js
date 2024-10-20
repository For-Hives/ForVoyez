import { FeatureHighlightsComponent } from '@/components/Plugins/FeatureHighlights.component'
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
				{/*<DetailedBenefitsPlugin />*/}
				{/*<DemoPlugin />*/}
				{/*<TestimonialsPlugin />*/}
				{/*<PricingPlugin />*/}
				{/*<FaqPlugin />*/}
				{/*<CtaPlugin />*/}
				{/*<SupportDocPlugin />*/}
			</main>
			<FooterComponent />
		</div>
	)
}
