import { NavbarComponent } from '@/components/Navbar.component'
import { HeroComponent } from '@/components/Landing/Hero/Hero.component'
import { FeatureComponent } from '@/components/Landing/Features/Feature.component'
import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import { CtaComponent } from '@/components/Landing/Cta/Cta.component'
import { FooterComponent } from '@/components/Footer.component'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroComponent />
				<FeatureComponent />
				<PricingComponent />
				<CtaComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
