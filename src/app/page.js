import { NavbarComponent } from '@/components/Navbar.component'
import { HeroComponent } from '@/components/LandingComponents/Hero/Hero.component'
import { FeatureComponent } from '@/components/LandingComponents/Features/Feature.component'
import { PricingComponent } from '@/components/LandingComponents/Pricing/Pricing.component'
import { CtaComponent } from '@/components/LandingComponents/Cta/Cta.component'
import { FooterComponent } from '@/components/Footer.component'
import { ClientComponent } from '@/app/clientComponent'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ClientComponent />
				<HeroComponent />
				<FeatureComponent />
				<PricingComponent />
				<CtaComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
