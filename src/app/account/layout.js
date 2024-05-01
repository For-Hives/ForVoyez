import { LayoutAccountComponent } from '@/components/AccountComponents/LayoutAccount.component'

export default async function Layout({ children }) {
	return (
		<div className="flex min-h-full bg-white antialiased">
			<div className="h-full w-full">
				<LayoutAccountComponent>{children}</LayoutAccountComponent>
			</div>
		</div>
	)
}
