import Image from 'next/image'
import { GlassmorphismComponent } from '@/components/LandingComponents/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoMidTopComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				title={'The City of Tomorrow'}
				alt={
					'A futuristic city with towering skyscrapers, sleek flying vehicles, and holographic billboards. The streets are illuminated by neon lights, and advanced robots assist humans in their daily lives.'
				}
				caption={
					'Step into the city of tomorrow, where technology and humanity intertwine in a breathtaking urban landscape.'
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
