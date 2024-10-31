'use strict'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import process from 'process'
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR) // set diaglog level to DEBUG when debugging

const exporterOptions = {
	url: 'http://old.lightin.io:4318/v1/traces', // use your own data region
	// headers: { 'signoz-access-token': 'SIGNOZ_INGESTION_KEY' }, // Use if you are using SigNoz Cloud
}

const traceExporter = new OTLPTraceExporter(exporterOptions)
const sdk = new NodeSDK({
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: 'ForVoyez PROD',
	}),
	instrumentations: [getNodeAutoInstrumentations()],
	traceExporter,
})

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()
