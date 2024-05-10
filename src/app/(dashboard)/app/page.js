'use client'
import {
	BookOpenIcon,
	ChartBarIcon,
	CodeBracketIcon,
	CreditCardIcon,
	KeyIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { useEffect } from 'react'

import { createUser } from '@/app/actions/app/createUser'
import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'

const mainResources = [
	{
		href: '/docs',
		name: 'Documentation',
		description: 'Discover our features and API reference.',
		icon: BookOpenIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/app/playground',
		name: 'Playground',
		description: 'Explore and test our API endpoints.',
		icon: CodeBracketIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
]

const configResources = [
	{
		href: '/app/tokens',
		name: 'API Keys',
		description: 'Manage your API keys and authentication.',
		icon: KeyIcon,
		pattern: {
			y: 32,
			squares: [
				[0, 2],
				[1, 4],
			],
		},
	},
	{
		href: '/app/usage',
		name: 'Usage',
		description: 'Track your API usage and limits.',
		icon: ChartBarIcon,
		pattern: {
			y: 22,
			squares: [[0, 1]],
		},
	},
	{
		href: '/app/plans',
		name: 'Plans',
		description: 'Upgrade or change your subscription plan.',
		icon: CreditCardIcon,
		pattern: {
			y: 16,
			squares: [
				[0, 1],
				[1, 3],
			],
		},
	},
	{
		href: '/support',
		name: 'Help & Support',
		description: 'Get help and support from our team.',
		icon: QuestionMarkCircleIcon,
		pattern: {
			y: -6,
			squares: [
				[-1, 2],
				[1, 3],
			],
		},
	},
]

export default function WelcomePage() {
	useEffect(() => {
		createUser().then(r => console.log(r))
	}, [])

	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<h1 className="mb-8 text-3xl font-bold">
				Welcome to the ForVoyez Developer Platform
			</h1>
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
					Start with the Basics
				</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-2">
					{mainResources.map(resource => (
						<ResourceCardAppComponent key={resource.href} resource={resource} />
					))}
				</div>
			</div>
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
					Configuration
				</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
					{configResources.map(resource => (
						<ResourceCardAppComponent key={resource.href} resource={resource} />
					))}
				</div>
			</div>
		</div>
	)
}
