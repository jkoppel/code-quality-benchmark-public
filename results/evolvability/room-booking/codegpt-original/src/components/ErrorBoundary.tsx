import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary Component
 * Implements Error Boundary pattern for graceful error handling
 * Follows Single Responsibility Principle - only handles error boundaries
 */

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className=\"error-boundary\">
          <div className=\"error-boundary-content\">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <details className=\"error-details\">
              <summary>Error Details</summary>
              <pre>{this.state.error?.message}</pre>
              {process.env.NODE_ENV === 'development' && (
                <pre>{this.state.errorInfo?.componentStack}</pre>
              )}
            </details>
            <button 
              onClick={() => window.location.reload()}
              className=\"reload-button\"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;