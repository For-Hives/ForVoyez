'use client'
import {
	BookOpenIcon,
	ChartBarIcon,
	CodeBracketIcon,
	CreditCardIcon,
	KeyIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'
import { Transition } from '@/components/Transitions/Transition.component'

const mainResources = [
	{
		pattern: {
			squares: [
				[0, 1],
				[1, 3],
			],
			y: 16,
		},
		description: 'Install the WordPress plugin and follow the steps to connect your account.',
		href: '/wordpress-plugin',
		testId: 'link-wordpress-plugin',
		name: 'WordPress plugin',
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
		description: 'Try generating descriptions for an image before using the plugin.',
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
		description: 'Create the key to connect your WordPress plugin, or revoke keys you no longer use.',
		testId: 'link-api-keys',
		href: '/app/tokens',
		name: 'API Keys',
		icon: KeyIcon,
	},
	{
		description: 'See your remaining credits and the images you have processed.',
		pattern: {
			squares: [[0, 1]],
			y: 22,
		},
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
		description: 'Get help, view frequently asked questions, and contact our support team.',
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

export default function AppPage() {
	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<Transition name="resource-home-title">
				<h1 className="mb-8 text-3xl font-bold">Your ForVoyez account</h1>
			</Transition>
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Start with the Basics</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-2">
					{mainResources.map(resource => (
						<ResourceCardAppComponent key={resource.href} resource={resource} />
					))}
				</div>
			</div>
			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Configuration</h2>
				<div className="mt-6 grid grid-cols-1 gap-8 border-t border-slate-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4">
					{configResources.map(resource => (
						<ResourceCardAppComponent key={resource.href} resource={resource} />
					))}
				</div>
			</div>
		</div>
	)
}
