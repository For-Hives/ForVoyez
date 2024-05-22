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

	// console.table(usage)

	return (
		<div className="">
			<h2 className="text-lg font-bold text-slate-700">How much left</h2>
			<div className={'flex gap-2'}>
				<p className="mt-1 text-sm text-slate-600">
					Follow how much you use the API in real-time :
				</p>
				{usage && usage.length ? (
					<p className={'mt-1 text-sm font-bold text-forvoyez_orange-600'}>
						{usage.length > 0 ? usage[usage.length - 1].y : 0}{' '}
						<span className={'font-semibold text-slate-500'}>credits left</span>
					</p>
				) : (
					<p className={'mt-1 text-sm text-slate-600'}>no usage yet</p>
				)}
			</div>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
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
