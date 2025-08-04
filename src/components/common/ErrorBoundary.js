import React from 'react';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorId: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.setState({ errorId });
        
       
        logger.error('react_component_crash', {
            success: false,
            errorMessage: error.message,
            details: {
                errorId: errorId,
                componentStack: errorInfo.componentStack,
            },
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h1>
                        <p className="text-gray-700 mb-4">
                            We're sorry, but the application encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <p className="text-gray-500 text-sm">
                            If the problem persists, please contact support and provide them with the following error ID: <strong>{this.state.errorId || 'N/A'}</strong>
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
