import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { registerOTel } from '@vercel/otel'

// Fonction pour créer l'exportateur OTLP basé sur l'environnement
const createTraceExporter = () => {
	const exporterOptions = {
		url: 'http://captain.beta.andy-cinquin.fr:4318/v1/traces',
	}

	if (typeof window === 'undefined') {
		// Environnement serveur
		return new OTLPTraceExporter(exporterOptions)
	} else {
		// Environnement navigateur
		return new OTLPTraceExporter(exporterOptions)
	}
}

// const sdk = new NodeSDK({
// 	resource: new Resource({
// 		[SEMRESATTRS_SERVICE_NAME]: 'forvoyez-app',
// 	}),
// 	spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
// 	traceExporter: createTraceExporter(),
// })

// sdk.start()

registerOTel({
	traceExporter: createTraceExporter(),
	serviceName: 'forvoyez-app',
})

console.info('Tracing initialized')
