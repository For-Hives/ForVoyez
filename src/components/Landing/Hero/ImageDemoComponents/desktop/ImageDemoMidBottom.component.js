import Image from 'next/image'

import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoMidBottomComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				alt={
					'A minimalist interior design of a modern living room. The space features clean lines, neutral colors, and an open floor plan. Large windows allow plenty of natural light, and a few carefully chosen accent pieces add visual interest.'
				}
				caption={
					'A minimalist interior design of a modern living room. The space features clean lines, neutral colors, and an open floor plan. Large windows allow plenty of natural light, and a few carefully chosen accent pieces add visual interest.'
				}
				title={'Minimalist Elegance'}
			/>
			<Image
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				className="aspect-2/3 w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/minimalist_interior_modern_living_room.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-slate-900/10 ring-inset" />
		</div>
	)
}
