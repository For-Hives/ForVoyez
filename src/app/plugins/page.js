import { PluginInstallationComponent } from '@/components/Plugins/PluginInstallation.component'
import { PluginFeatureComponent } from '@/components/Plugins/PluginFeature.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { FooterComponent } from '@/components/Footer.component'

export default function PluginPage() {
	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<header className="bg-gray-50 py-16 sm:py-32">
					<div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
						{/* Left side: Text content */}
						<div className="max-w-2xl">
							<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
								WordPress Plugin for Seamless Integration
							</h1>
							<p className="mt-6 text-lg leading-8 text-slate-600">
								Integrate our API with WordPress in minutes. No coding needed.
								Automate your image SEO and streamline your workflow with our
								powerful plugin.
							</p>
						</div>

						{/* Right side: Image, only visible on larger screens */}
						<div className="hidden lg:block">
							<img
								alt="Forvoyez fox playing with WordPress logo"
								className="mx-8 h-auto w-[400px] object-cover"
								src="/images/plugins/forvoyez_wordpress.png"
							/>
						</div>
					</div>
				</header>

				<PluginFeatureComponent />
				<PluginInstallationComponent />
			</main>
			<FooterComponent />
		</div>
	)
}
