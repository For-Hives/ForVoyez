import { LayoutAppComponent } from '@/components/AppComponents/LayoutApp.component'

export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="h-full w-full">
				<LayoutAppComponent>{children}</LayoutAppComponent>
			</div>
		</div>
	)
}
