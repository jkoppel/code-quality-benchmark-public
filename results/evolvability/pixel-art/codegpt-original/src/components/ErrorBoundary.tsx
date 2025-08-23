import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component - handles JavaScript errors in component tree
 * Follows Single Responsibility Principle - only handles error boundaries
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className=\"error-boundary\">
          <div className=\"error-content\">
            <h2>🎨 Oops! Something went wrong</h2>
            <p>
              The Pixel Art Editor encountered an unexpected error. 
              Don't worry, your work might still be saved in your browser.
            </p>
            
            <div className=\"error-actions\">
              <button 
                onClick={this.handleReset}
                className=\"error-button retry-button\"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className=\"error-button reload-button\"
              >
                🔃 Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className=\"error-details\">
                <summary>Error Details (Development)</summary>
                <div className=\"error-stack\">
                  <h4>Error Message:</h4>
                  <pre>{this.state.error.message}</pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4>Stack Trace:</h4>
                      <pre>{this.state.error.stack}</pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;