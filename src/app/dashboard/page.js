'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { createUser } from '@/components/dashboard/createUser'

export default function WelcomePage() {
	useEffect(() => {
		createUser().then(r => console.log(r))
	}, [])

	return (
		<>
			<h1 className="text-3xl">Welcome to the ForVoyez Developer Platform</h1>
			<div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
				<div className="group relative">
					<div className="mt-4 flex justify-between">
						<div>
							<h3 className="text-sm text-gray-700">
								<Link href="#">
									<span aria-hidden="true" className="absolute inset-0" />
									Start with the Basics
								</Link>
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Online tools and resources to get you started.
							</p>
						</div>
					</div>
				</div>
				<div className="group relative">
					<div className="mt-4 flex justify-between">
						<div>
							<h3 className="text-sm text-gray-700">
								<Link href="#">
									<span aria-hidden="true" className="absolute inset-0" />
									Documentation
								</Link>
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								Discover our features and API reference.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-12">
				<h2 className="text-2xl font-bold tracking-tight text-gray-900">
					Configuration
				</h2>
				<div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
					<div className="group relative">
						<div className="mt-4 flex justify-between bg-red-500">
							<div>
								<h3 className="text-sm text-gray-700">
									<Link href="#">
										<span aria-hidden="true" className="absolute inset-0" />
										Playground
									</Link>
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Explore and test our API endpoints.
								</p>
							</div>
						</div>
					</div>
					<div className="group relative">
						<div className="mt-4 flex justify-between">
							<div>
								<h3 className="text-sm text-gray-700">
									<Link href="#">
										<span aria-hidden="true" className="absolute inset-0" />
										API Keys
									</Link>
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Manage your API keys and authentication.
								</p>
							</div>
						</div>
					</div>
					<div className="group relative">
						<div className="mt-4 flex justify-between">
							<div>
								<h3 className="text-sm text-gray-700">
									<Link href="#">
										<span aria-hidden="true" className="absolute inset-0" />
										Usage
									</Link>
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Track your API usage and limits.
								</p>
							</div>
						</div>
					</div>
					<div className="group relative">
						<div className="mt-4 flex justify-between">
							<div>
								<h3 className="text-sm text-gray-700">
									<Link href="#">
										<span aria-hidden="true" className="absolute inset-0" />
										Plans
									</Link>
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									Upgrade or change your subscription plan.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/*<div className="p-8">*/}
			{/*	<h1 className="mb-4 text-xl font-bold">embark here</h1>*/}

			{/*	<div className="flex flex-col">*/}
			{/*		<Link href="/dashboard/tokens">tokens</Link>*/}
			{/*		<Link href="/dashboard/plans">plans</Link>*/}
			{/*	</div>*/}
			{/*</div>*/}
		</>
	)
}
