import Image from 'next/image'
import { GlassmorphismComponent } from '@/components/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoRightTopComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				title={"Whiskered Wonder: A Kitten's Gaze"}
				alt={
					'Close-up of a kitten with striking, wide eyes and patterned fur, peering curiously'
				}
				caption={
					"Captivated by curiosity, this kitten's gaze pierces through the lens, inviting a moment of connection."
				}
			/>
			<Image
				src="/images/cute_cat.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
