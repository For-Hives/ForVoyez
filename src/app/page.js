import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// fixme change the landing page
export default function Home() {
	return (
		<>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Track Your Social Media Analytics Easier Than Ever.</title>
			<meta name="robots" content="index, follow" />
			<meta
				name="googlebot"
				content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
			/>
			<meta
				name="bingbot"
				content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
			/>
			<meta property="og:site_name" content="ForVoyez" />
			<link rel="icon" type="image/x-icon" href="/favicon.png" />
			<meta
				name="description"
				content="Generate the meta-description for all your images through ou API. Embed the power of SEO in your images."
			/>
			<meta
				property="og:title"
				content="An API to Generate the meta-description for all your images."
			/>
			<meta
				property="og:description"
				content="Generate the meta-description for all your images through ou API. Embed the power of SEO in your images."
			/>
			<meta property="og:type" content="website" />

			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
				className="wtd-font"
			/>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Unbounded"
				className="wtd-font"
			/>

			{/*--------------------------------------------------------- WEBSITE -----------------------------------------------------------------------------------------------*/}

			<div id="__nuxt">
				<div>
					<Navbar />

					{/* --------------- MAIN ----------------------------------------------------------------------------------------------------------------------------------*/}
					<main>
						{/*[*/}
						<div className="p-16">
							<header className="container mx-auto">
								<div className="flex h-full w-full flex-col items-center justify-center gap-4">
									<h1 className="text-5xl font-bold text-gray-900">
										Generate meta-description for all your images.
									</h1>
									<h2 className="text-xl font-semibold text-gray-900">
										Unlock the power of SEO in your images with our API.
									</h2>
									<div className="flex justify-center">
										<Link
											className="rounded-full bg-gray-800 px-10 py-6 text-lg font-semibold uppercase text-white"
											href="https://app.pallyy.com/register"
											data-type="primary"
										>
											Get started for free
										</Link>
									</div>
									<div className="">
										<p className="usedby__title">
											Trusted daily by growing brands and agencies around the
											world including:
										</p>
										<div className="mt-4 flex items-center justify-center gap-16">
											<img
												className="used-by-logo anytimefitness"
												alt="Used by Anytime Fitness logo"
												width={58}
												height={58}
												src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/250px-Google_2015_logo.svg.png"
												sizes="110px"
											/>
											<img
												className="used-by-logo mantra"
												alt="Used by Mantra logo"
												width={58}
												height={66}
												src="https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Discord_Logo_sans_texte.svg/1818px-Discord_Logo_sans_texte.svg.png"
												sizes="110px"
											/>
											<img
												className="used-by-logo lj-hooker"
												alt="Used by LJ Hooker logo"
												width={58}
												height={50}
												src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/220px-Wikipedia-logo-v2.svg.png"
												sizes="110px"
											/>
										</div>
									</div>
									<picture>
										<source
											media="(max-width: 768px)"
											width={1000}
											height={1000}
											srcSet="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.pnghttps://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1428 1428w"
										/>
										<img
											src="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?w=400"
											srcSet="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.pnghttps://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 1600px) 80vw, (min-width: 1300px) 90vw, calc(100vw - 40px)"
											height={652}
											width={1000}
											alt="Track Your Social Media Analytics Easier Than Ever."
											className="hero__image"
										/>
									</picture>
								</div>
							</header>
						</div>
						{/*]*/}
					</main>
				</div>
			</div>
		</>
	)
}
