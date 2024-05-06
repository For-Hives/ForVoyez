import Image from 'next/image'
import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoMidBottomComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				title={'Minimalist Elegance'}
				alt={
					'A minimalist interior design of a modern living room. The space features clean lines, neutral colors, and an open floor plan. Large windows allow plenty of natural light, and a few carefully chosen accent pieces add visual interest.'
				}
				caption={
					'A minimalist interior design of a modern living room. The space features clean lines, neutral colors, and an open floor plan. Large windows allow plenty of natural light, and a few carefully chosen accent pieces add visual interest.'
				}
			/>
			<Image
				src="/images/minimalist_interior_modern_living_room.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="aspect-[2/3] w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/10" />
		</div>
	)
}
