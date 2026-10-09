import Image from 'next/image'

export function TextDemoBottomMobileComponent() {
	return (
		<div className="relative">
			<Image
				alt="Example image for AI-generated alt text"
				className="aspect-2/3 w-full rounded-xl bg-slate-900/5 object-cover shadow-lg"
				height={350}
				src="/images/tranquil_forest_crystal-clear.webp"
				width={200}
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-slate-900/10 ring-inset" />
		</div>
	)
}
