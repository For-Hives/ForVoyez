'use client'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import Link from 'next/link'

import { GridPatternAppComponent } from '@/components/App/GridPatternApp.component'

export function ResourceCardAppComponent({ resource }) {
	let mouseX = useMotionValue(0)
	let mouseY = useMotionValue(0)

	function onMouseMove({ currentTarget, clientX, clientY }) {
		let { left, top } = currentTarget.getBoundingClientRect()
		mouseX.set(clientX - left)
		mouseY.set(clientY - top)
	}

	return (
		<div
			className="group relative flex rounded-2xl bg-slate-50 transition-shadow hover:shadow-md hover:shadow-slate-900/5"
			data-testid={resource.testId}
			key={resource.href}
			onMouseMove={onMouseMove}
		>
			<ResourcePattern {...resource.pattern} mouseX={mouseX} mouseY={mouseY} />
			<div className="group-hover:ring-forvoyez_orange-500/10 absolute inset-0 rounded-2xl ring-1 ring-slate-900/7.5 ring-inset" />
			<div className="relative rounded-2xl px-4 pt-16 pb-4">
				<ResourceIcon icon={resource.icon} />
				<h3 className="mt-4 text-sm leading-7 font-semibold text-slate-900">
					<Link href={resource.href}>
						{' '}
						<span className="absolute inset-0 rounded-2xl" />
						{resource.name}
					</Link>
				</h3>
				<p className="mt-1 text-sm text-slate-600">{resource.description}</p>
			</div>
		</div>
	)
}

export function ResourcePattern({ mouseX, mouseY, ...gridProps }) {
	let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
	let style = { WebkitMaskImage: maskImage, maskImage }

	return (
		<div className="pointer-events-none">
			<div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
				<GridPatternAppComponent
					className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5"
					height={56}
					width={72}
					x="50%"
					{...gridProps}
				/>
			</div>
			<motion.div
				className="from-forvoyez_orange-200/20 to-forvoyez_orange-300/20 absolute inset-0 rounded-2xl bg-linear-to-r opacity-0 transition duration-300 group-hover:opacity-100"
				style={style}
			/>
			<motion.div
				className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
				style={style}
			>
				<GridPatternAppComponent
					className="fill-forvoyez_orange-500/50 stroke-forvoyez_orange-500/70 absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg]"
					height={56}
					width={72}
					x="50%"
					{...gridProps}
				/>
			</motion.div>
		</div>
	)
}

function ResourceIcon({ icon: Icon }) {
	return (
		<div className="group-hover:ring-forvoyez_orange-500/25 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 ring-1 ring-slate-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50">
			<Icon className="group-hover:fill-forvoyez_orange-500/10 group-hover:stroke-forvoyez_orange-500 h-5 w-5 fill-slate-500/10 stroke-slate-500 transition-colors duration-300" />
		</div>
	)
}
