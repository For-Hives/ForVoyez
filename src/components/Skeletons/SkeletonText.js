// Inline placeholder for a value still loading, such as the credit balance: a
// 0 shown meanwhile would read as "no credits left".
export const SkeletonText = props => (
	<span
		className="inline-block h-4 w-8 animate-pulse rounded-sm bg-slate-200 align-middle"
		data-testid={props.dataTestId}
	>
		<span className="sr-only">Loading</span>
	</span>
)
