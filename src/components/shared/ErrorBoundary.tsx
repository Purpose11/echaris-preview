import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--fs-h2, 24px)",
              fontWeight: "var(--fw-bold, 700)",
              color: "var(--text-heading, #1a1a1a)",
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: "var(--text-muted, #827c74)",
              fontSize: "var(--fs-body, 15px)",
              maxWidth: "460px",
            }}
          >
            Please refresh the page and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              padding: "10px 24px",
              borderRadius: "var(--radius-md, 10px)",
              border: "1px solid var(--border-default, #cbc7c1)",
              background: "var(--surface-card, #fff)",
              color: "var(--text-heading, #1a1a1a)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
