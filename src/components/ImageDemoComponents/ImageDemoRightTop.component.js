export function ImageDemoRightTopComponent() {
	return (
		<div className="relative">
			<img
				src="https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80"
				alt=""
				className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
			/>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
		</div>
	)
}
