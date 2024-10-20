import { HeroSectionComponent } from '@/components/Plugins/HeroSection.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'
// import { FeatureHighlightsPlugin } from '@/components/Plugin/FeatureHighlightsPlugin'
// import { HowItWorksPlugin } from '@/components/Plugin/HowItWorksPlugin'
// import { DetailedBenefitsPlugin } from '@/components/Plugin/DetailedBenefitsPlugin'
// import { DemoPlugin } from '@/components/Plugin/DemoPlugin'
// import { TestimonialsPlugin } from '@/components/Plugin/TestimonialsPlugin'
// import { PricingPlugin } from '@/components/Plugin/PricingPlugin'
// import { FaqPlugin } from '@/components/Plugin/FaqPlugin'
// import { CtaPlugin } from '@/components/Plugin/CtaPlugin'
// import { SupportDocPlugin } from '@/components/Plugin/SupportDocPlugin'

export default function WordPressPluginPage() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroSectionComponent />
				{/*<FeatureHighlightsPlugin />*/}
				{/*<HowItWorksPlugin />*/}
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
