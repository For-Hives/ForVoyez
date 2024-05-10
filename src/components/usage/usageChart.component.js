'use client'
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import { getUsageForUser } from '@/services/database.service'

export function UsageChartComponent() {
	const [usage, setUsage] = useState([])

	const auth = useAuth()

	// get data from database
	useEffect(() => {
		getUsageForUser(auth.userId).then(setUsage)
	}, [])

	console.table(usage)

	return (
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center" id={'usage'}>
					<div className="">
						How much left
						{usage && usage.length ? (
							<p>
								<span>{usage.length > 0 ? usage[usage.length - 1].y : 0}</span>
								/100
							</p>
						) : (
							<p>no usage yet</p>
						)}
					</div>
					<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
						Usage
					</h2>
					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						Follow how much you use the API in real-time
					</p>
				</div>
				<div className="h-[50vh] min-h-[500px]">
					{usage && usage.length && (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								width={500}
								height={400}
								data={usage}
								margin={{
									top: 10,
									right: 30,
									left: 0,
									bottom: 0,
								}}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="x" />
								<YAxis />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="y"
									stroke="#fff"
									fill="#ff6545"
									dot={true}
									fillOpacity={1}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}{' '}
				</div>
			</div>
		</div>
	)
}
