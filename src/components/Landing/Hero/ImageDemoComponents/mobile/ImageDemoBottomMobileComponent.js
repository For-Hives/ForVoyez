import Image from 'next/image'

import { GlassmorphismComponent } from '@/components/Landing/Hero/ImageDemoComponents/GlassmorphismMobile.component'

export function ImageDemoBottomMobileComponent() {
	return (
		<div className="relative">
			<GlassmorphismComponent
				alt={
					'A tranquil forest scene with a crystal-clear stream flowing through a lush green landscape. Sunlight filters through the tall trees, casting dappled shadows on the forest floor. A variety of plants and wildlife can be seen thriving in their natural habitat.'
				}
				caption={
					'Escape to the serenity of nature and be embraced by the peaceful beauty of this enchanting forest.'
				}
				title={'Sylvan Serenity'}
			/>
			<Image
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				className="aspect-[2/3] w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/tranquil_forest_crystal-clear.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/10" />
		</div>
	)
}
