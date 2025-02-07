import Image from 'next/image'

import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoMidTopComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				alt={
					'A futuristic city with towering skyscrapers, sleek flying vehicles, and holographic billboards. The streets are illuminated by neon lights, and advanced robots assist humans in their daily lives.'
				}
				caption={
					'Step into the city of tomorrow, where technology and humanity intertwine in a breathtaking urban landscape.'
				}
				title={'The City of Tomorrow'}
			/>
			<Image
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				className="aspect-2/3 w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/futuristic_city_skyscrapers.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-slate-900/10 ring-inset" />
		</div>
	)
}
