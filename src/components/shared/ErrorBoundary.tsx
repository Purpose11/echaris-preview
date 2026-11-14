import { Component, type ErrorInfo, type ReactNode } from "react";

import { AppErrorFallback } from "@/components/shared/AppErrorFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label for logs when nesting multiple boundaries. */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  /** Bumped on retry so children fully remount instead of reusing a broken tree. */
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.name
      ? `[ErrorBoundary:${this.props.name}]`
      : "[ErrorBoundary]";
    console.error(label, error, info.componentStack);
  }

  private reset = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return <AppErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return (
      <div
        key={this.state.resetKey}
        data-error-boundary={this.props.name ?? "default"}
        style={{ display: "contents" }}
      >
        {this.props.children}
      </div>
    );
  }
}
