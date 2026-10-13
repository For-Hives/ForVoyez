'use client'
import { PlayIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useState } from 'react'
import { track } from '@/helpers/analytics'

// The YouTube player loads YouTube and DoubleClick scripts, which set cookies,
// as soon as its iframe is on the page. Until the visitor asks for the video,
// the page only shows the video's own thumbnail, served by the app: nothing is
// requested from YouTube or Google. The thumbnail is YouTube's maxresdefault.jpg
// without the black bars it has on both sides, cropped to 16:9.
const VIDEO_URL = 'https://www.youtube-nocookie.com/embed/tY-C1fPhCtE?autoplay=1'

// The button that had the focus is gone: the player takes it, so that the
// keyboard keeps acting on the video. The visitor is already looking at it.
function focusPlayer(player) {
	player?.focus({ preventScroll: true })
}

export function PluginVideoComponent({ location }) {
	const [isPlayerLoaded, setIsPlayerLoaded] = useState(false)

	function play() {
		track('wp-video-play', { location })
		setIsPlayerLoaded(true)
	}

	return (
		<div className="aspect-video w-full">
			{isPlayerLoaded ? (
				<iframe
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="rounded-xl"
					height="100%"
					ref={focusPlayer}
					src={VIDEO_URL}
					title="ForVoyez WordPress Plugin Demo"
					width="100%"
				></iframe>
			) : (
				<button
					aria-label="Play the ForVoyez WordPress plugin demo"
					className="group focus-visible:outline-forvoyez_orange-600 relative block h-full w-full cursor-pointer overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4"
					onClick={play}
					type="button"
				>
					<Image
						alt=""
						className="h-full w-full object-cover"
						height={711}
						sizes="(min-width: 1024px) 544px, (min-width: 640px) 592px, calc(100vw - 6rem)"
						src="/images/wordpress-plugin/plugin-demo-poster.webp"
						width={1264}
					/>
					<span className="bg-forvoyez_orange-500 group-hover:bg-forvoyez_orange-600 absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white transition group-hover:scale-110 sm:h-20 sm:w-20">
						<PlayIcon aria-hidden="true" className="ml-1 h-8 w-8 sm:h-10 sm:w-10" />
					</span>
				</button>
			)}
		</div>
	)
}
