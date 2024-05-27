import Image from 'next/image'

export function TextDemoTopMobileComponent() {
	return (
		<div className="relative">
			<Image
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				className="aspect-[2/3] w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/cute_cat.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/10" />
		</div>
	)
}
