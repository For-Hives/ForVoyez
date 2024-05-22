'use client'
import { useAuth } from '@clerk/nextjs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Label,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import { getUsageByToken, getUsageForUser } from '@/services/database.service'

export function UsageChartComponent() {
	const [usage, setUsage] = useState([])
	const [usageByToken, setUsageByToken] = useState([])

	const { userId } = useAuth()

	useEffect(() => {
		async function fetchUsage() {
			const data = await getUsageForUser(userId)
			setUsage(data)
		}

		async function fetchUsageByToken() {
			const data = await getUsageByToken(userId)
			const formattedData = data.map(entry => ({
				token: entry.token,
				used: entry.used,
			}))
			setUsageByToken(formattedData)
		}

		if (userId) {
			fetchUsage()
			fetchUsageByToken()
		}
	}, [userId])

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
					<p className="text-sm text-slate-600">No usage yet</p>
				)}
			</div>
			<div className="mt-8 h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={usage}
						margin={{
							top: 0,
							right: 0,
							left: 0,
							bottom: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="fullDate"
							tickFormatter={fullDate =>
								format(new Date(fullDate), 'd MMM, HH:mm', { locale: fr })
							}
							tickMargin={10}
							tickSize={10}
						/>
						<YAxis tickMargin={10} tickSize={0} />
						<Tooltip
							labelFormatter={fullDate =>
								format(new Date(fullDate), 'd MMMM yyyy, HH:mm', { locale: fr })
							}
						/>
						<Legend
							wrapperStyle={{
								paddingTop: 20,
							}}
						/>
						<Area
							type="monotone"
							dataKey="creditsLeft"
							name="Credits Left"
							stroke="#ff6545"
							fill="#fedebb"
							dot={true}
							fillOpacity={0.5}
						/>
					</AreaChart>
				</ResponsiveContainer>
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
			<div className="mt-8 h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={usageByToken}
						margin={{
							top: 0,
							right: 0,
							left: 0,
							bottom: 0,
						}}
						barSize={20}
					>
						<XAxis
							dataKey="token"
							scale={'point'}
							padding={{ left: 10, right: 10 }}
							tickMargin={10}
							tickSize={10}
						/>
						<YAxis tickMargin={10} tickSize={0} allowDecimals={false} />
						<Tooltip />
						<Legend
							wrapperStyle={{
								paddingTop: 20,
							}}
						/>
						<CartesianGrid strokeDasharray="3 3" />
						<Bar
							dataKey="used"
							name="Used Tokens"
							stroke="#ff6545"
							fill="#fedebb"
							fillOpacity={0.5}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
