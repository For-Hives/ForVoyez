import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

import { ClerkProvider } from '@clerk/nextjs'
import { Jost, Source_Sans_3 } from 'next/font/google'

const sourcesans = Source_Sans_3({
	weight: ['300', '400', '700', '900'],
	subsets: ['latin'],
	variable: '--font-sourcesans',
	style: ['normal', 'italic'],
})

const jost = Jost({
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	subsets: ['latin'],
	variable: '--font-jost',
	style: ['normal'],
})

export const metadata = {
	title: 'Here is the forhives template',
	description: 'Here is the forhives template',
	metadataBase: new URL('https://forvoyez.com/'),
	alternates: {
		canonical: '/',
		languages: {
			'en-US': 'https://forvoyez.com/',
		},
	},
}

export default function RootLayout({ children }) {
	return (
		<ClerkProvider>
			<html className={`${sourcesans.variable} ${jost.variable}`} lang={'en'}>
				<body className={'flex min-h-screen w-full flex-col text-slate-950'}>
					{children}
				</body>
			</html>
		</ClerkProvider>
	)
}
