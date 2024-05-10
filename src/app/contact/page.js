import { ToastContainer } from 'react-toastify'

import { ContactComponent } from '@/components/Contact/Contact.component'
import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ToastContainer closeOnClick className={'z-50'} />
				<ContactComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
