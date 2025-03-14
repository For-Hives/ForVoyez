import { UsageChartComponent } from '@/components/usage/usageChart.component'

export const metadata = {
	description:
		'Monitor your API usage, track request patterns, and analyze your ForVoyez integration performance.',
	title: 'Usage Analytics',
}

export default function UsagePage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">API Usage</h1>
			<p className="mt-1 text-sm text-slate-600">
				Track your API usage in real-time. Monitor your monthly credit
				consumption and analyze trends to optimize your usage and plan ahead.
				The chart below displays your credit usage over time.
			</p>
			<UsageChartComponent />
		</div>
	)
}
