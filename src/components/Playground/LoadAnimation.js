export function LoadAnimation() {
	return (
		<div className="relative mt-2 w-full animate-pulse overflow-hidden rounded-md border-0 py-4 pl-2.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
			<div className="h-4 w-full animate-pulse rounded-md bg-gray-200"></div>
			<div className="mt-2 h-4 w-full animate-pulse rounded-md bg-gray-200"></div>
			<div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-gray-200"></div>
		</div>
	)
}
