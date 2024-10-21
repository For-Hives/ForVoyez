import { FeatureHighlightsComponent } from '@/components/Plugins/FeatureHighlights.component'
import { TestimonialsComponent } from '@/components/Plugins/Testimonials.component'
import { HeroSectionComponent } from '@/components/Plugins/HeroSection.component'
import { HowItWorksComponent } from '@/components/Plugins/HowItWorks.component'
import { CtaPluginComponent } from '@/components/Plugins/CtaPlugin.component'
import { FaqPluginComponent } from '@/components/Plugins/FaqPlugin.component'
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
				<FaqPluginComponent />
				<CtaPluginComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
