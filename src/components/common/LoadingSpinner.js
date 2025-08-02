import React from 'react';

const LoadingSpinner = ({ small }) => (
    <div className="flex justify-center items-center h-full">
        <div className={`animate-spin rounded-full ${small ? 'h-5 w-5 border-t-2 border-b-2' : 'h-12 w-12 border-t-4 border-b-4'} border-blue-500`}></div>
    </div>
);

export default LoadingSpinner;
