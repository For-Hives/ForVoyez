'use client'
import { useEffect } from 'react'

import {
	BookOpenIcon,
	ChartBarIcon,
	CodeBracketIcon,
	CreditCardIcon,
	KeyIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { createUser } from '@/app/actions/app/createUser'

import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'

const mainResources = [
	{
		pattern: {
			squares: [
				[0, 1],
				[1, 3],
			],
			y: 16,
		},
		description: 'Discover our features and API reference.',
		href: 'https://doc.forvoyez.com/',
		testId: 'link-documentation',
		name: 'Documentation',
		icon: BookOpenIcon,
	},
	{
		pattern: {
			squares: [
				[-1, 2],
				[1, 3],
			],
			y: -6,
		},
		description: 'Explore and test our API endpoints.',
		testId: 'link-playground',
		href: '/app/playground',
		icon: CodeBracketIcon,
		name: 'Playground',
	},
]

const configResources = [
	{
		pattern: {
			squares: [
				[0, 2],
				[1, 4],
			],
			y: 32,
		},
		description: 'Manage your API keys and authentication.',
		testId: 'link-api-keys',
		href: '/app/tokens',
		name: 'API Keys',
		icon: KeyIcon,
	},
	{
		pattern: {
			squares: [[0, 1]],
			y: 22,
		},
		description: 'Track your API usage and limits.',
		testId: 'link-usage',
		href: '/app/usage',
		icon: ChartBarIcon,
		name: 'Usage',
	},
	{
		pattern: {
			squares: [
				[0, 1],
				[1, 3],
			],
			y: 16,
		},
		description: 'Upgrade or change your subscription plan.',
		icon: CreditCardIcon,
		testId: 'link-plans',
		href: '/app/plans',
		name: 'Plans',
	},
	{
		description:
			'Get help, view frequently asked questions, and contact our support team.',
		pattern: {
			squares: [
				[-1, 2],
				[1, 3],
			],
			y: -6,
		},
		icon: QuestionMarkCircleIcon,
		name: 'Help, FAQ & Contact',
		testId: 'link-help',
		href: '/contact',
	},
]

export default function ClientLogicDashboard() {
	useEffect(() => {
		createUser()
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
