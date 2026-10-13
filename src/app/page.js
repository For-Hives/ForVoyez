import { FooterComponent } from '@/components/Footer.component'
import { CtaComponent } from '@/components/Landing/Cta/Cta.component'
import { DevelopersComponent } from '@/components/Landing/Developers/Developers.component'
import { FeatureComponent } from '@/components/Landing/Features/Feature.component'
import { HeroComponent } from '@/components/Landing/Hero/Hero.component'
import { PluginComponent } from '@/components/Landing/Plugin/Plugin.component'
import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import { NavbarComponent } from '@/components/Navbar.component'

// Fail the build if marketing navigation unexpectedly starts requiring server work.
export const ensureStatic = 'navigation'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroComponent />
				<FeatureComponent />
				<PluginComponent />
				{/* After the plugin, before the prices: the credits below pay for both the plugin and the API. */}
				<DevelopersComponent />
				<PricingComponent />
				<CtaComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
