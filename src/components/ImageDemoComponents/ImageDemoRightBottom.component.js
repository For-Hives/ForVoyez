import Image from 'next/image'

export function ImageDemoRightBottomComponent() {
	return (
		<div className="relative">
			<Image
				src="/images/tranquil_forest_crystal-clear.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
