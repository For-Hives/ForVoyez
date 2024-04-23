import { NavbarComponent } from '@/components/Navbar.component'
import { HeroComponent } from '@/components/LandingComponents/Hero/Hero.component'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<HeroComponent />
			</main>
		</div>
	)
}
