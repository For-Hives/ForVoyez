import { LayoutDashboardComponent } from '@/components/DashboardComponents/LayoutDashboard.component'

export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="h-full w-full">
				<LayoutDashboardComponent>{children}</LayoutDashboardComponent>
			</div>
		</div>
	)
}
