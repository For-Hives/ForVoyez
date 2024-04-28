import { LayoutDashboard } from '@/app/dashboard/LayoutDashboard'

export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="w-full">
				<LayoutDashboard>{children}</LayoutDashboard>
			</div>
		</div>
	)
}
