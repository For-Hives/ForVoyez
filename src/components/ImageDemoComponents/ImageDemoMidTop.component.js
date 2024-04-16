import Image from 'next/image'
import { GlassmorphismComponent } from '@/components/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoMidTopComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				text={
					'An abstract expressionist painting with bold, sweeping brushstrokes and vibrant colors. The artwork conveys a sense of movement and emotion...'
				}
			/>
			<Image
				src="/images/futuristic_city_skyscrapers.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
