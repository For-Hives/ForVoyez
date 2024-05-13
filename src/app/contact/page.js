import { ToastContainer } from 'react-toastify'

import { ContactComponent } from '@/components/Contact/Contact.component'
import { FooterComponent } from '@/components/Footer.component'
import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	title: 'Contact Us - ForVoyez',
	description:
		'Get in touch with the ForVoyez team for support, partnership opportunities, or any other inquiries related to our image metadata generation services.',
	alternates: {
		canonical: '/contact',
	},
}

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
