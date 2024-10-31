// export async function register() {
// 	console.info('next runtime :  ' + process.env.NEXT_RUNTIME)
// 	console.info('node env :  ' + process.env.NODE_ENV)
// 	if (
// 		process.env.NEXT_RUNTIME === 'nodejs'
// 		// &&
// 		// process.env.NODE_ENV === 'production'
// 	) {
// 		console.info('Instrumentation is enabled, your are in production mode')
// 		await import('./instrumentation.node.js')
// 	}
//
// 	if (
// 		process.env.NEXT_RUNTIME === 'edge'
// 		// &&
// 		// process.env.NODE_ENV === 'production'
// 	) {
// 		console.info('Instrumentation is enabled, your are in production mode')
// 		await import('./instrumentation.edge.js')
// 	}
// }

import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'

let initialized = false

// MEMO : l'instrumentation semble fonctionner non seulement au moment du runtime, mais aussi pendant le build

export function register() {
	// Une spécificité (ou un bug ?) fait que register peut être appelé N fois, donc on ajoute un contrôle
	// Réf : https://github.com/vercel/next.js/issues/51450
	console.info('instrumentation activée')
	if (initialized) return
	initialized = true

	// MEMO : le runtime est censé tourner uniquement sous Node.js par défaut,
	// mais il arrive qu’il démarre en edge (ou que process.env.NEXT_RUNTIME retourne "edge"),
	// donc on exécute l’instrumentation quel que soit l’environnement.
	// Si l'instrumentation devient stable (est-ce même possible ?), on pourra ajouter une condition selon l'environnement.
	// Réf : https://github.com/vercel/next.js/issues/61728

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
		}), // attributes: {
		// 	'highlight.project_id': 'YOUR_PROJECT_ID',
		// 	'highlight.source': 'backend',
		// },
		instrumentationConfig: {
			fetch: {
				propagateContextUrls: ['*'],
			},
		},
		serviceName: 'ForVoyez',
	})
}
