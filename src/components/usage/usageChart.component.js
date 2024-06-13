'use client'
import { useEffect, useState } from 'react'

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { useAuth } from '@clerk/nextjs'
import { fr } from 'date-fns/locale'
import { format } from 'date-fns'

import { getUsageByToken, getUsageForUser } from '@/services/database.service'
import { SkeletonLoader } from '@/components/Skeletons/SkeletonChart'

export function UsageChartComponent() {
	const [usage, setUsage] = useState([])
	const [usageByToken, setUsageByToken] = useState([])
	const [isLoadingUsage, setIsLoadingUsage] = useState(true)
	const [isLoadingUsageByToken, setIsLoadingUsageByToken] = useState(true)
	const [showTooltip, setShowTooltip] = useState(false)

	const { userId } = useAuth()

	useEffect(() => {
		async function fetchUsage() {
			try {
				const data = await getUsageForUser()
				console.log('Usage data:', data)
				setUsage(data)
			} catch (error) {
				console.error('Error fetching usage data:', error)
			}
		}

		async function fetchUsageByToken() {
			const data = await getUsageByToken()
			const formattedData = data.map(entry => ({
				token: entry.token,
				used: entry.used,
			}))
			setUsageByToken(formattedData)
		}

		if (userId) {
			fetchUsage()
			fetchUsageByToken()
			Promise.all([fetchUsage(), fetchUsageByToken()]).finally(() => {
				setIsLoadingUsage(false)
				setIsLoadingUsageByToken(false)
				if (usage.length === 0 && usageByToken.length === 0) {
					setShowTooltip(true)
				} else {
					setShowTooltip(false)
				}
			})
		}
	}, [userId])

	useEffect(() => {
		if (usage.length === 0 && usageByToken.length === 0) {
			setShowTooltip(true)
		} else {
			setShowTooltip(false)
		}
	}, [usage, usageByToken])

	return (
		<div className="mx-auto max-w-7xl px-6 lg:px-8">
			<h2 className="mb-0 text-2xl font-bold text-slate-800">
				Remaining Credits Over Time
			</h2>
			<div className="mt-0 flex gap-2">
				<p className="text-sm text-slate-600">
					Follow your remaining credits over time:
				</p>
				{usage.length > 0 ? (
					<p className="text-sm font-bold text-forvoyez_orange-600">
						{usage[usage.length - 1].creditsLeft}{' '}
						<span className="font-semibold text-slate-500">credits left</span>
					</p>
				) : (
					<p className="text-sm text-slate-600" data-testid="no-usage-data">
						No usage yet
					</p>
				)}
			</div>
			{showTooltip && (
				<div
					className="not-prose pointer-events-none fixed inset-x-0 bottom-0 z-50 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8"
					data-testid="usage-tooltip"
				>
					<div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
						<p className="text-sm leading-6 text-white">
							<strong className="font-semibold">Usage Data</strong>
							<svg
								aria-hidden="true"
								className="mx-2 inline h-0.5 w-0.5 fill-current"
								viewBox="0 0 2 2"
							>
								<circle cx="1" cy="1" r="1" />
							</svg>
							You need to have used the application at least once to see the
							usage data.
						</p>
					</div>
				</div>
			)}
			<div className="mt-8 h-[400px]" data-testid="usage-chart-container">
				{isLoadingUsage ? (
					<SkeletonLoader dataTestId="skeleton-loader" />
				) : usage.length > 0 ? (
					<ResponsiveContainer
						data-testid="usage-chart"
						height="100%"
						width="100%"
					>
						<AreaChart
							data={usage}
							margin={{
								bottom: 0,
								right: 0,
								left: 0,
								top: 0,
							}}
						>
							<defs>
								<linearGradient
									id="colorCreditsLeft"
									x1="0"
									x2="0"
									y1="0"
									y2="1"
								>
									<stop offset="0%" stopColor="#ff6545" stopOpacity={0.3} />
									<stop offset="100%" stopColor="#ff6545" stopOpacity={0.05} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="fullDate"
								minTickGap={50}
								tickFormatter={fullDate =>
									format(new Date(fullDate), 'd MMM, HH:mm', { locale: fr })
								}
								tickMargin={10}
								tickSize={10}
							/>
							<YAxis tickMargin={10} tickSize={0} />
							<Tooltip
								labelFormatter={fullDate =>
									format(new Date(fullDate), 'd MMMM yyyy, HH:mm', {
										locale: fr,
									})
								}
							/>
							<Legend
								wrapperStyle={{
									paddingTop: 20,
								}}
							/>
							<Area
								dataKey="creditsLeft"
								dot={false}
								fill="url(#colorCreditsLeft)"
								fillOpacity={1}
								name="Credits Left"
								stroke="#ff6545"
								type="monotone"
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<div className="flex h-full items-center justify-center">
						<p className="text-sm text-slate-600" data-testid="no-usage-data">
							No usage data available.
						</p>
					</div>
				)}
			</div>
			<h2 className="mb-0 mt-12 text-2xl font-bold text-slate-800">
				Usage by Token
			</h2>
			<div className="mt-0 flex gap-2">
				<p className={'text-sm text-slate-600'}>
					Track your usage by token, and identify which tokens are being used
					the most.
				</p>
			</div>
			<div
				className="mt-8 h-[400px]"
				data-testid="usage-by-token-chart-container"
			>
				{isLoadingUsageByToken ? (
					<SkeletonLoader data-testid="skeleton-loader" />
				) : usageByToken.length > 0 ? (
					<ResponsiveContainer
						data-testid="usage-by-token-chart"
						height="100%"
						width="100%"
					>
						<BarChart
							barSize={20}
							data={usageByToken}
							margin={{
								bottom: 0,
								right: 0,
								left: 0,
								top: 0,
							}}
						>
							<defs>
								<linearGradient
									id="colorUsedTokens"
									x1="0"
									x2="0"
									y1="0"
									y2="1"
								>
									<stop offset="0%" stopColor="#ff6545" stopOpacity={1} />
									<stop offset="100%" stopColor="#ff6545" stopOpacity={0.7} />
								</linearGradient>
							</defs>
							<XAxis
								dataKey="token"
								padding={{ right: 10, left: 10 }}
								scale={'point'}
								tickMargin={10}
								tickSize={10}
							/>
							<YAxis allowDecimals={false} tickMargin={10} tickSize={0} />
							<Tooltip />
							<Legend
								wrapperStyle={{
									paddingTop: 20,
								}}
							/>
							<CartesianGrid strokeDasharray="3 3" />
							<Bar
								dataKey="used"
								fill="url(#colorUsedTokens)"
								fillOpacity={1}
								name="Used Tokens"
							/>
						</BarChart>
					</ResponsiveContainer>
				) : (
					<div className="flex h-full items-center justify-center">
						<p
							className="text-sm text-slate-600"
							data-testid="no-usage-by-token-data"
						>
							No usage data available by token.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
