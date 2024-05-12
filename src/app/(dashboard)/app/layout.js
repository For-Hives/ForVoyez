import Script from 'next/script'

import { LayoutAppComponent } from '@/components/App/LayoutApp.component'

export default async function Layout({ children }) {
	return (
		<html lang="en">
			<Script
				async
				src="https://umami.wadefade.fr/script.js"
				strategy="afterInteractive"
				data-website-id="705a7c53-7dc4-4cf7-b625-f2f87a428bfb"
				data-domains={'forvoyez.com'}
			></Script>

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
