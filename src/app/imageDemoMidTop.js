export function ImageDemoMidTop() {
	return (
		<div className="relative">
			<img
				src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
				alt=""
				className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
