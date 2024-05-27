import { Playground } from '@/components/Playground/Playground.component'

import 'react-toastify/dist/ReactToastify.css'

export const metadata = {
	description:
		"Experiment with ForVoyez's image metadata generation API in our interactive playground and discover its powerful capabilities.",
	alternates: {
		canonical: '/app/playground',
	},
	title: 'API Playground - ForVoyez',
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
