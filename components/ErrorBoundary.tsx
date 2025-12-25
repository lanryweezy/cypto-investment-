import React from 'react';
import { errorService } from '../services/errorService';
import { ShieldX, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to our error service
    errorService.logError('React Error Boundary caught an error', error, {
      errorInfo,
      componentStack: errorInfo.componentStack
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldX className="text-red-400" size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      
      {error && (
        <details className="mb-6 w-full max-w-md text-left bg-black/50 p-4 rounded-lg border border-red-500/20">
          <summary className="text-red-400 cursor-pointer mb-2">Error Details</summary>
          <div className="text-sm text-gray-300 font-mono">
            <div className="mb-2">
              <span className="text-red-400">Message:</span> {error.message}
            </div>
            <div>
              <span className="text-red-400">Stack:</span> 
              <pre className="mt-1 p-2 bg-black/30 rounded text-xs overflow-x-auto">{error.stack}</pre>
            </div>
          </div>
        </details>
      )}
      
      <button
        onClick={resetError}
        className="flex items-center gap-2 px-6 py-3 bg-crypto-accent text-black font-bold rounded-lg hover:bg-cyan-400 transition-all"
      >
        <RotateCcw size={18} />
        Try Again
      </button>
    </div>
  );
};

export default ErrorBoundary;