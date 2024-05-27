import { ToastContainer } from 'react-toastify'

import { ContactComponent } from '@/components/Contact/Contact.component'
import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description:
		'Get in touch with the ForVoyez team for support, partnership opportunities, or any other inquiries related to our image metadata generation services.',
	alternates: {
		canonical: '/contact',
	},
	title: 'Contact Us - ForVoyez',
}

export default function Home() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<ToastContainer className={'z-50'} closeOnClick />
				<ContactComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
