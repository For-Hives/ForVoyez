import Link from 'next/link'

export function TopLevelNavItemAppComponent({ className, children, href }) {
	return (
		<li>
			<Link
				className={
					'text-sm leading-5 text-slate-600 transition hover:text-slate-900' +
					' ' +
					className
				}
				href={href}
			>
				{children}
			</Link>
		</li>
	)
}
