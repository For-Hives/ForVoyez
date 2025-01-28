import { Playground } from '@/components/Playground/Playground.component'

import 'react-toastify/dist/ReactToastify.css'

export const metadata = {
	description:
		'Test and experiment with ForVoyez API endpoints in our interactive playground. Generate image metadata in real-time.',
	title: 'API Playground',
}
export default function PlaygroundPage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">API Playground</h1>
			<p className="text-slate-600">
				Explore and test our powerful image processing API. Upload an image,
				provide additional context, and specify the desired JSON schema. See the
				real-time preview of your request and the API response.
			</p>
			<Playground />
		</div>
	)
}
