const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
let sentryModule: typeof import("@sentry/react") | null = null;

export async function initMonitoring() {
  if (!dsn || sentryModule) return;
  sentryModule = await import("@sentry/react");
  sentryModule.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
    sendDefaultPii: false,
  });
}

export function captureFrontendException(error: Error, componentStack?: string | null) {
  if (!sentryModule) return;
  sentryModule.captureException(error, componentStack ? { contexts: { react: { componentStack } } } : undefined);
}
