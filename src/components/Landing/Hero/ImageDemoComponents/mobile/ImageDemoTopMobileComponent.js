import Image from 'next/image'

import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/GlassmorphismMobile.component'

export function ImageDemoTopMobileComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				alt={
					'Close-up of a kitten with striking, wide eyes and patterned fur, peering curiously'
				}
				caption={
					"Captivated by curiosity, this kitten's gaze pierces through the lens, inviting a moment of connection."
				}
				title={"Whiskered Wonder: A Kitten's Gaze"}
			/>
			<Image
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				className="aspect-2/3 w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/cute_cat.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-slate-900/10 ring-inset" />
		</div>
	)
}
