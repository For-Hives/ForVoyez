import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'

registerOTel({
	spanProcessors: [
		new BatchSpanProcessor(
			new OTLPHttpJsonTraceExporter({
				url: 'http://old.lightin.io:4318/v1/traces',
			})
		),
	],
	traceExporter: new OTLPHttpJsonTraceExporter({
		url: 'http://old.lightin.io:4318/v1/traces',
	}),
	attributes: {
		'highlight.project_id': 'YOUR_PROJECT_ID',
		'highlight.source': 'backend',
	},
	instrumentationConfig: {
		fetch: {
			propagateContextUrls: ['*'],
		},
	},
	serviceName: 'ForVoyez',
})
