import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

registerOTel({
	spanProcessors: [
		new BatchSpanProcessor(
			new OTLPHttpJsonTraceExporter({
				url: 'http://localhost:4318/v1/traces',
			})
		),
	],
	attributes: {
		'highlight.project_id': 'YOUR_PROJECT_ID',
		'highlight.source': 'backend',
	},
	traceExporter: new OTLPHttpJsonTraceExporter({
		url: 'http://localhost:4318/v1/traces',
	}),
	instrumentationConfig: {
		fetch: {
			propagateContextUrls: ['*'],
		},
	},
	serviceName: 'ForVoyez',
})
