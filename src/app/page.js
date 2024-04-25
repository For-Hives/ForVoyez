import { NavbarComponent } from '@/components/Navbar.component'
import { HeroComponent } from '@/components/LandingComponents/Hero/Hero.component'
import { FeatureComponent } from '@/components/LandingComponents/Features/Feature.component'
import { PricingComponent } from '@/components/LandingComponents/Pricing/Pricing.component'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroComponent />
				<FeatureComponent />
				<PricingComponent />
			</main>
		</div>
	)
}
