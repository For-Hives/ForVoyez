import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

import WrapNextUiProvider from '@/providers/WrapNextUiProvider'
import { Kanit, Playpen_Sans } from 'next/font/google'

// fixme replace that with your chosen font
const kanit = Kanit({
	weight: ['100', '300', '400', '700', '900'],
	subsets: ['latin'],
	variable: '--font-kanit',
	style: ['normal', 'italic'],
})

// fixme replace that with your chosen font
const playpen_sans = Playpen_Sans({
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	subsets: ['latin'],
	variable: '--font-playpen_sans',
	style: ['normal'],
})

export const metadata = {
	title: 'Here is the forhives template',
	description: 'Here is the forhives template',
	// fixme replace that with your own url
	metadataBase: new URL('http://localhost:8080'),
	alternates: {
		canonical: '/',
		languages: {
			// fixme replace that with your own url
			'fr-FR': 'http://localhost:8080',
			'en-US': 'http://localhost:8080',
		},
	},
}

export default function RootLayout({ children }) {
	return (
		<html className={`${kanit.variable} ${playpen_sans.variable}`}>
			<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
				<WrapNextUiProvider>{children}</WrapNextUiProvider>
			</body>
		</html>
	)
}
