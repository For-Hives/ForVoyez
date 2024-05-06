import Image from 'next/image'
import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoLeftComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				title={'Whirlwind of Emotions'}
				alt={
					'An abstract expressionist painting with bold, sweeping brushstrokes and vibrant colors. The artwork conveys a sense of movement and emotion, inviting the viewer to interpret its meaning.'
				}
				caption={
					'Immerse yourself in a whirlwind of emotions with this vibrant and captivating abstract expressionist painting.'
				}
			/>
			<Image
				src="/images/abstract_expressionist_painting.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="z-40 aspect-[2/3] w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 z-40 rounded-xl ring-1 ring-inset ring-slate-900/10" />
		</div>
	)
}
