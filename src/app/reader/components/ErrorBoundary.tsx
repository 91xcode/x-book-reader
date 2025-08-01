'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
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
    console.error('Reader Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error!} 
            reset={() => this.setState({ hasError: false, error: null })} 
          />
        );
      }

      return (
        <div className="h-screen flex items-center justify-center bg-base-100">
          <div className="flex flex-col items-center space-y-4 text-center max-w-md">
            <div className="text-error text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-error">
              书籍加载错误
            </h1>
            <p className="text-base-content/70">
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <div className="flex gap-4">
              <button 
                className="btn btn-primary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                重试
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => window.location.href = '/library'}
              >
                返回图书馆
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;