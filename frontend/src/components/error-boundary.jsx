import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon 
} from "@heroicons/react/24/outline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can log the error to an error reporting service here
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg shadow-xl bg-base-100">
            <div className="card-body text-center">
              <div className="mb-6">
                <ExclamationTriangleIcon className="w-20 h-20 text-error mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-base-content mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-base-content/70">
                  We encountered an unexpected error. Our team has been notified.
                </p>
              </div>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-base-200 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-bold text-error mb-2">Error Details:</h3>
                  <pre className="text-sm text-base-content/80 whitespace-pre-wrap overflow-x-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-base-content/60 mt-2 whitespace-pre-wrap overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReload}
                  className="btn btn-primary gap-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-outline gap-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  Go Home
                </button>
              </div>

              <div className="divider"></div>
              
              <div className="text-sm text-base-content/60">
                <p>If this problem persists, please contact our support team.</p>
                <a 
                  href="mailto:support@tixtra.com" 
                  className="link link-primary"
                >
                  support@tixtra.com
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;