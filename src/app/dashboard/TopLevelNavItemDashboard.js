import Link from 'next/link'

export function TopLevelNavItemDashboard({ href, children, className }) {
	return (
		<li>
			<Link
				href={href}
				className={
					'text-sm leading-5 text-slate-600 transition hover:text-slate-900' +
					' ' +
					className
				}
			>
				{children}
			</Link>
		</li>
	)
}
