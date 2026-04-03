/**
 * Sentry Error Boundary
 * Wraps React components to catch and report errors
 *
 * USAGE:
 * <SentryErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </SentryErrorBoundary>
 */

'use client';

import React, { ReactNode, ReactElement } from 'react';
import * as Sentry from '@sentry/nextjs';
import { captureException } from './config';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactElement | null;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Class-based Error Boundary (required for error boundaries in React)
 */
export class SentryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });

    // Call user's error handler if provided
    this.props.onError?.(error, errorInfo);

    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      // Use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            margin: '20px',
          }}
        >
          <h2 style={{ color: '#d32f2f', marginBottom: '10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            We apologize for the inconvenience. The error has been reported to our team.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ textAlign: 'left', marginBottom: '20px' }}>
              <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
                Error details (development only)
              </summary>
              <pre
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '10px',
                }}
              >
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.resetError}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with error boundary
 * @example
 * const SafeComponent = withErrorBoundary(MyComponent);
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactElement | null
) => {
  const Wrapped = (props: P) => (
    <SentryErrorBoundary fallback={fallback}>
      <Component {...props} />
    </SentryErrorBoundary>
  );

  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return Wrapped;
};

/**
 * Default error fallback component
 * Can be used as a template for custom fallbacks
 */
export const DefaultErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => {
  return (
    <div
      style={{
        padding: '20px',
        margin: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ color: '#856404', marginBottom: '10px' }}>Error Occurred</h3>
      <p style={{ color: '#856404', marginBottom: '15px' }}>
        {error.message}
      </p>
      <button
        onClick={resetError}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ffc107',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  );
};

/**
 * Custom error boundary for async operations
 * Use for API calls and promises
 */
export class AsyncErrorBoundary extends React.Component<
  {
    children: ReactNode;
    onError?: (error: Error) => void;
  },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(String(event.reason));
    this.setState({ error });
    this.props.onError?.(error);
    captureException(error, {
      type: 'unhandled_promise_rejection',
    });
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    captureException(error);
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
