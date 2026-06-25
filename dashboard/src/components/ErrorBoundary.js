import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught runtime error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#c0392b", marginBottom: 12 }}>
            Something went wrong
          </h2>
          <p style={{ color: "#555", maxWidth: 480 }}>
            An unexpected error occurred in the dashboard. Please refresh the
            page. If the problem persists, contact support.
          </p>
          <pre
            style={{
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: 6,
              padding: "12px 20px",
              color: "#c0392b",
              fontSize: 13,
              maxWidth: 600,
              overflowX: "auto",
              marginTop: 16,
            }}
          >
            {this.state.error?.message || "Unknown error"}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 24,
              padding: "10px 28px",
              background: "#387ed1",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
