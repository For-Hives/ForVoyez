import { GridPatternAppComponent } from '@/components/App/GridPatternApp.component'

export function HeroPatternAppComponent() {
	return (
		<div className="pointer-events-none absolute inset-0 z-10 mx-0 max-w-none overflow-hidden">
			<div className="absolute top-0 left-1/2 ml-[-38rem] h-[25rem] w-[81.25rem]">
				<div className="from-forvoyez_orange-300 absolute inset-0 bg-linear-to-r to-white opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
					<GridPatternAppComponent
						className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay"
						height={56}
						squares={[
							[4, 3],
							[2, 1],
							[7, 3],
							[10, 6],
						]}
						width={72}
						x={-12}
						y={4}
					/>
				</div>
				<svg
					aria-hidden="true"
					className="absolute top-0 left-1/2 ml-[-19rem] w-[69.5625rem] fill-white blur-[26px]"
					viewBox="0 0 1113 440"
				>
					<path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
				</svg>
			</div>
		</div>
	)
}
