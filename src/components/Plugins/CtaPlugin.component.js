import Image from 'next/image'
import Link from 'next/link'

export function CtaPluginComponent() {
	return (
		<div className="bg-white">
			<div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
				<div className="relative isolate overflow-hidden rounded-3xl bg-forvoyez_orange-500 px-6 py-16 shadow-2xl sm:px-16 sm:pb-0 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
					<svg
						aria-hidden="true"
						className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
						viewBox="0 0 1024 1024"
					>
						<circle
							cx={512}
							cy={512}
							fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
							fillOpacity="0.7"
							r={512}
						/>
						<defs>
							<radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
								<stop stopColor="#FFF" />
								<stop offset={1} stopColor="#FF9776" />
							</radialGradient>
						</defs>
					</svg>
					<div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Boost your WordPress SEO.
							<br />
							Start using ForVoyez today.
						</h2>
						<p className="mt-6 text-lg leading-8 text-gray-100">
							Enhance your website's accessibility and search engine performance
							with our free, AI-powered alt text generator. Join thousands of
							satisfied WordPress users and start optimizing your images now.
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
							<Link
								className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-forvoyez_orange-500 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
								href="https://wordpress.org/plugins/auto-alt-text-for-images/"
							>
								Download Now
							</Link>
						</div>
					</div>
					<div className="relative hidden h-80 sm:block lg:h-auto lg:flex-1">
						<div className="absolute inset-0 flex items-center justify-center">
							<Image
								alt="ForVoyez wordpress app screenshot"
								className="max-h-full max-w-full rounded-md object-contain ring-1 ring-white/10"
								height={1080}
								src="/images/plugins/screenshot.webp"
								width={1824}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
