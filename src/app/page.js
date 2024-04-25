import { NavbarComponent } from '@/components/Navbar.component'
import { HeroComponent } from '@/components/LandingComponents/Hero/Hero.component'
import { FeatureComponent } from '@/components/LandingComponents/Features/Feature.component'

export default function Home() {
	return (
		<div className="min-h-[700vh] bg-white">
			<NavbarComponent />
			<main>
				<HeroComponent />
				<FeatureComponent />
			</main>
		</div>
	)
}
