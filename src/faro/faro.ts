import { Faro, getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { trace, context } from '@opentelemetry/api';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FaroTraceExporter, FaroSessionSpanProcessor } from '@grafana/faro-web-tracing';
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";

let faro: Faro | null = null
export function initInstrumentation(): void {
  if (typeof window === 'undefined' || faro !== null) return

  getFaro()
}

export function getFaro(): Faro {
  if (faro != null) return faro
  faro = initializeFaro({
    url: "https://faro-collector-prod-us-east-0.grafana.net/collect/a7d64ea2c3274d986f8540ad8f958d71",
    app: {
      name: "PMVS NextJs",
      version: "1.0.0",
      environment: "production",
    },
    instrumentations: [
      // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
      ...getWebInstrumentations(),

      // Initialization of the tracing package.
      // This packages is optional because it increases the bundle size noticeably. Only add it if you want tracing data.
      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: [
            new RegExp("http://localhost:8080/*"),
            new RegExp('localhost:8080')
          ]
        }
      }),
    ],
  });

  // setup OpenTelemetry provider
  const provider = new WebTracerProvider();

  // set up span processors and Faro trace exporter
  provider.addSpanProcessor(
    new FaroSessionSpanProcessor(new BatchSpanProcessor(new FaroTraceExporter({ ...faro })), faro.metas),
  );

  provider.register({
    contextManager: new ZoneContextManager()
  });

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations(),
    ],
  });

  // register OpenTelemetry API with Faro Web SDK instance
  faro.api.initOTEL(trace, context);

  // start the provider
  // provider.start();

  return faro
}