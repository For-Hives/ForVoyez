export const SkeletonLoader = props => (
	<div className="animate-pulse" data-testid={props.dataTestId}>
		<div className="h-[400px] w-full rounded-lg bg-slate-200"></div>
	</div>
)
