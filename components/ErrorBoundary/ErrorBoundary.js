// components/ErrorBoundary.js
'use client'
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded">
          <h3>Something went wrong</h3>
          <p>{this.state.error.message}</p>
          <button 
            onClick={this.handleRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;