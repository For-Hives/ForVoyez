import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'
import { ContactComponent } from '@/components/ContactComponents/Contact.component'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ContactComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
