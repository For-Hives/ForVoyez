'use client'
import {
	DocumentTextIcon,
	ShieldCheckIcon,
	ScaleIcon,
} from '@heroicons/react/24/outline'

import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'

const legalResources = [
	{
		href: '/app/legal-notice',
		name: 'Legal Notice',
		description: 'View our legal notice and company information.',
		icon: DocumentTextIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/app/privacy-policy',
		name: 'Privacy Policy',
		description: 'Learn about our privacy practices and data protection.',
		icon: ShieldCheckIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
	{
		href: '/app/terms',
		name: 'Terms of Service',
		description: 'Read our terms of service and usage policies.',
		icon: ScaleIcon,
		pattern: {
			y: 32,
			squares: [
				[0, 2],
				[1, 4],
			],
		},
	},
]

export const metadata = {
	title: 'Legal - ForVoyez',
	description:
		'Access the legal information for ForVoyez, including our legal notice, privacy policy, and terms of service.',
	alternates: {
		canonical: '/app/legal',
	},
}

export default function LegalDashboard() {
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
