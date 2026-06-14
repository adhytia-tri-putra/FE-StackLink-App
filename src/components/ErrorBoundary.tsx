import React from "react";

class ErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("Unhandled UI error", error, info); }
  render() {
    if (this.state.error) return <main className="flex min-h-screen items-center justify-center bg-surface p-6 text-center"><div><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="mt-2 text-on-surface-variant">The error has been logged. Reload the page to continue.</p><button onClick={() => window.location.reload()} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-on">Reload</button></div></main>;
    return this.props.children;
  }
}

export default ErrorBoundary;
