import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'
import { ContactComponent } from '@/components/ContactComponents/Contact.component'
import { ToastContainer } from 'react-toastify'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ToastContainer closeOnClick />
				<ContactComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
