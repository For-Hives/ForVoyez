import Script from 'next/script'

import { LayoutAppComponent } from '@/components/App/LayoutApp.component'

export const metadata = {
	description:
		'Access your ForVoyez dashboard to manage your API keys, monitor usage, and explore our powerful image metadata generation capabilities.',
	alternates: {
		canonical: '/app',
	},
	title: 'Dashboard - ForVoyez',
}

export default async function Layout({ children }) {
	return (
		<html lang="en">
			<body>
				<div className="flex min-h-full bg-white antialiased">
					<div className="h-full w-full">
						<LayoutAppComponent>{children}</LayoutAppComponent>
					</div>
				</div>
			</body>
		</html>
	)
}
