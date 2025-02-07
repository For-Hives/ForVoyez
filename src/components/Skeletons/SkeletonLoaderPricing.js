export function SkeletonLoaderPricing() {
	return (
		<div
			className="animate-pulse rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10"
			key="custom"
		>
			<div className="my-4 h-6 w-3/4 rounded-sm bg-slate-200"></div>
			<div className="mb-2 h-4 w-full rounded-sm bg-slate-200"></div>
			<div className="my-0 h-4 w-1/4 rounded-sm bg-slate-200"></div>
			<div className="my-4 h-12 w-3/4 rounded-sm bg-slate-200"></div>
			<div className="my-4 h-4 w-1/4 rounded-sm bg-slate-200"></div>
			<div className="my-4 h-8 w-full rounded-sm bg-slate-200"></div>

			<ul className="mt-8 space-y-5 text-sm leading-6 text-slate-600 xl:mt-10">
				{[...Array(11)].map((_, i) => (
					<li className="flex gap-x-3" key={i}>
						<div className="h-4 w-5 flex-none rounded-sm bg-slate-200"></div>
						<div className="h-4 w-full rounded-sm bg-slate-200"></div>
					</li>
				))}
			</ul>
		</div>
	)
}
