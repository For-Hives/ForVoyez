import Image from 'next/image'

export function ImageDemoLeftComponent() {
	return (
		<div className="relative">
			<div
				className={
					'shadow-[0 4px 30px rgba(0, 0, 0, 0.1)] absolute left-0 top-0 h-full w-full rounded-xl bg-white/50 backdrop-blur-lg ' +
					'z-50 border border-white/30'
				}
			>
				<div className={'flex h-full w-full scale-[90%] flex-col items-start'}>
					<p>{`{`}</p>
					<div className={'flex flex-grow items-center'}>
						&emsp;
						{`"alternativeText": "Chocolate cake toffee croissant shortbread
							sesame snaps danish .sesame snaps danish .sesame snaps danish ."`}
					</div>
					<p>{`}`}</p>
				</div>
			</div>
			<Image
				src="/images/abstract_expressionist_painting.webp"
				alt="Image of an abstract expressionist painting, demo of the generated alt text API"
				width={200}
				height={350}
				className="z-40 aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 z-40 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
