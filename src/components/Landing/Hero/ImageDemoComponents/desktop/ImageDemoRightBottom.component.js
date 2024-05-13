import Image from 'next/image'

import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/Glassmorphism.component'

export function ImageDemoRightBottomComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				title={'Sylvan Serenity'}
				alt={
					'A tranquil forest scene with a crystal-clear stream flowing through a lush green landscape. Sunlight filters through the tall trees, casting dappled shadows on the forest floor. A variety of plants and wildlife can be seen thriving in their natural habitat.'
				}
				caption={
					'Escape to the serenity of nature and be embraced by the peaceful beauty of this enchanting forest.'
				}
			/>
			<Image
				src="/images/tranquil_forest_crystal-clear.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="aspect-[2/3] w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/10" />
		</div>
	)
}
