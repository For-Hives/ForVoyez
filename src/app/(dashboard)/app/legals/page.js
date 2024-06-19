'use client'
import {
	DocumentTextIcon,
	ScaleIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline'

import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'

const legalResources = [
	{
		pattern: {
			squares: [
				[0, 1],
				[1, 3],
			],
			y: 16,
		},
		description: 'View our legal notice and company information.',
		href: '/app/legals/legal-notice',
		testId: 'link-legal-notice',
		icon: DocumentTextIcon,
		name: 'Legal Notice',
	},
	{
		pattern: {
			squares: [
				[-1, 2],
				[1, 3],
			],
			y: -6,
		},
		description: 'Learn about our privacy practices and data protection.',
		href: '/app/legals/privacy-policy',
		testId: 'link-privacy-policy',
		name: 'Privacy Policy',
		icon: ShieldCheckIcon,
	},
	{
		pattern: {
			squares: [
				[0, 2],
				[1, 4],
			],
			y: 32,
		},
		description: 'Read our terms of service and usage policies.',
		testId: 'link-terms-of-service',
		href: '/app/legals/terms',
		name: 'Terms of Service',
		icon: ScaleIcon,
	},
]

export default function LegalsPage() {
	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<h1 className="mb-8 text-3xl font-bold">Legal Information</h1>
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
					Important Legal Documents
				</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-3">
					{legalResources.map(resource => (
						<ResourceCardAppComponent key={resource.href} resource={resource} />
					))}
				</div>
			</div>
		</div>
	)
}
