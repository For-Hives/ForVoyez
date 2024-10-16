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
					<div className="mx-auto flex max-w-7xl flex-col px-6 sm:flex-row lg:px-8">
						{/* Left side: Text content */}
						<div className="max-w-2xl">
							<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
								Boost Your Image SEO and Accessibility with AI
							</h1>
							<p className="mt-6 text-lg leading-8 text-slate-600">
								ForVoyez Auto Alt Text is a WordPress plugin that automatically
								generates SEO-optimized alternative texts for your images using
								AI. No coding needed, just upload your images and let our plugin
								take care of the rest.
							</p>
							<a
								className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
								href="https://doc.forvoyez.com/wordpress-plugin"
							>
								Learn More
							</a>
						</div>
						{/* Right side: Image, only visible on larger screens */}
						<div className="hidden lg:block">
							<img
								alt="Forvoyez fox playing with WordPress logo"
								className="mx-8 h-auto w-[800px] object-cover"
								src="/images/plugins/forvoyez_wordpress.png"
							/>
						</div>
					</div>
				</header>

				<main>
					<section className="bg-white py-16">
						<div className="mx-auto max-w-7xl px-6 lg:px-8">
							<h2 className="text-3xl font-bold text-slate-900">
								Key Features
							</h2>
							<p className="mt-2 text-lg text-slate-600">
								Explore the powerful features of ForVoyez Auto Alt Text for
								Images:
							</p>

							<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<div className="rounded-lg bg-gray-100 p-6 text-center">
									<img
										alt="AI Icon"
										className="mx-auto mb-4"
										src="/icons/ai.svg"
									/>
									<h3 className="text-xl font-semibold text-slate-800">
										AI-powered alt text generation
									</h3>
									<p className="text-sm text-slate-600">
										Automatically generate SEO-friendly alt texts using AI for
										every image on your site.
									</p>
								</div>

								<div className="rounded-lg bg-gray-100 p-6 text-center">
									<img
										alt="Bulk processing Icon"
										className="mx-auto mb-4"
										src="/icons/bulk-processing.svg"
									/>
									<h3 className="text-xl font-semibold text-slate-800">
										Bulk Processing
									</h3>
									<p className="text-sm text-slate-600">
										Save time by processing all your existing images in a few
										clicks.
									</p>
								</div>
							</div>
						</div>
					</section>
				</main>

				<PluginFeatureComponent />

				<PluginInstallationComponent />

				<main>
					<section className="bg-gray-50 py-16">
						<div className="mx-auto max-w-7xl px-6 lg:px-8">
							<h2 className="text-3xl font-bold text-slate-900">
								Installation
							</h2>
							<p className="mt-2 text-lg text-slate-600">
								Follow these steps to install ForVoyez Auto Alt Text Plugin:
							</p>

							<ol className="mt-6 space-y-4">
								<li className="flex items-start">
									<span className="font-semibold text-blue-600">1.</span>
									<div className="ml-4">
										<p className="text-slate-600">
											Download the plugin from{' '}
											<a
												className="text-blue-600 underline"
												href="https://github.com/For-Hives/ForVoyez-Wordpress-plugin/releases/"
											>
												GitHub
											</a>{' '}
											or the WordPress marketplace.
										</p>
										<img
											alt="Install Plugin Step 1"
											className="mt-2 rounded-lg shadow-lg"
											src="/images/install-plugin.png"
										/>
									</div>
								</li>
								<li className="flex items-start">
									<span className="font-semibold text-blue-600">2.</span>
									<div className="ml-4">
										<p className="text-slate-600">
											Upload the .zip file through the WordPress admin
											interface.
										</p>
										<img
											alt="Upload Plugin"
											className="mt-2 rounded-lg shadow-lg"
											src="/images/upload-plugin.png"
										/>
									</div>
								</li>

								{/*Continue steps with visual aids */}
							</ol>

							<div className="mt-8">
								<a
									className="rounded-lg bg-blue-600 px-4 py-2 text-white"
									href="/docs/installation-video"
								>
									Watch Installation Video
								</a>
							</div>
						</div>
					</section>
				</main>

				<main>
					<section className="bg-white py-16">
						<div className="mx-auto max-w-7xl px-6 lg:px-8">
							<h2 className="text-3xl font-bold text-slate-900">
								Configuration
							</h2>
							<p className="mt-2 text-lg text-slate-600">
								Here&apos;s how to configure your plugin and connect to ForVoyez
								API:
							</p>

							<ol className="mt-6 space-y-4">
								<li className="flex items-start">
									<span className="font-semibold text-blue-600">1.</span>
									<div className="ml-4">
										<p className="text-slate-600">
											Go to the ForVoyez Auto Alt Text settings in your
											WordPress admin area.
										</p>
										<img
											alt="Settings Page"
											className="mt-2 rounded-lg shadow-lg"
											src="/images/settings-page.png"
										/>
									</div>
								</li>
								<li className="flex items-start">
									<span className="font-semibold text-blue-600">2.</span>
									<div className="ml-4">
										<p className="text-slate-600">
											Enter your API key from the{' '}
											<a
												className="text-blue-600 underline"
												href="https://forvoyez.com/dashboard"
											>
												ForVoyez dashboard
											</a>
											.
										</p>
										<img
											alt="API Key Input"
											className="mt-2 rounded-lg shadow-lg"
											src="/images/api-key-input.png"
										/>
									</div>
								</li>

								{/*Continue steps with visuals */}
							</ol>

							<div className="mt-8">
								<a
									className="rounded-lg bg-blue-600 px-4 py-2 text-white"
									href="/docs/configuration-help"
								>
									Read More on Configuration
								</a>
							</div>
						</div>
					</section>
				</main>

				<main>
					<section className="bg-gray-50 py-16">
						<div className="mx-auto max-w-7xl px-6 lg:px-8">
							<h2 className="text-3xl font-bold text-slate-900">
								Managing Images with ForVoyez
							</h2>
							<p className="mt-2 text-lg text-slate-600">
								Here&apos;s how you can manage your images using the ForVoyez
								plugin:
							</p>

							<div className="mt-8">
								<img
									alt="Manage Images Grid"
									className="rounded-lg shadow-lg"
									src="/images/manage-images-grid.png"
								/>
								<p className="mt-4 text-slate-600">
									Use the bulk processing option to generate alt texts for
									selected images in one go.
								</p>
							</div>

							<div className="mt-8">
								<a
									className="rounded-lg bg-blue-600 px-4 py-2 text-white"
									href="/docs/manage-images-video"
								>
									Watch Managing Images Tutorial
								</a>
							</div>
						</div>
					</section>
				</main>

				<main>
					<section className="bg-white py-16">
						<div className="mx-auto max-w-7xl px-6 lg:px-8">
							<h2 className="text-3xl font-bold text-slate-900">
								Support & FAQ
							</h2>
							<p className="mt-2 text-lg text-slate-600">
								Need help? Here are the most common questions answered:
							</p>

							<div className="mt-8">
								<div className="accordion">
									<div className="accordion-item">
										<h3 className="accordion-title">
											How to generate an API key?
										</h3>
										<div className="accordion-content">
											<p>
												To generate your API key, log in to your ForVoyez
												dashboard and navigate to the API section. Copy the
												generated key and paste it into your plugin settings.
											</p>
										</div>
									</div>

									{/*Add more FAQ items here*/}
								</div>
							</div>

							<div className="mt-8">
								<a
									className="rounded-lg bg-blue-600 px-4 py-2 text-white"
									href="/support"
								>
									Contact Support
								</a>
							</div>
						</div>
					</section>
				</main>
			</main>
			<FooterComponent />
		</div>
	)
}
