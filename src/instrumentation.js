import { OTLPTraceExporter as OTLPTraceExporterBrowser } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPTraceExporter as OTLPTraceExporterNode } from '@opentelemetry/exporter-trace-otlp-http'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
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
		return new OTLPTraceExporterNode(exporterOptions)
	} else {
		// Environnement navigateur
		return new OTLPTraceExporterBrowser(exporterOptions)
	}
}

const traceExporter = createTraceExporter()

export function register() {
	if (typeof window === 'undefined') {
		// Configuration pour l'environnement serveur
		const sdk = new NodeSDK({
			resource: new Resource({
				[SemanticResourceAttributes.SERVICE_NAME]: 'your-project-name',
			}),
			spanProcessor: new SimpleSpanProcessor(traceExporter),
		})

		sdk.start()
		console.info('OpenTelemetry initialized for server')
	} else {
		// Configuration pour l'environnement navigateur
		registerOTel({
			serviceName: 'your-project-name',
			traceExporter: traceExporter,
		})
		console.info('OpenTelemetry initialized for browser')
	}
}
