import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = ({ onLogin, switchToSignup, switchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back!</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-email">
                        Email Address
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-password">
                        Password
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                {/* --- NEW FORGOT PASSWORD LINK --- */}
                <div className="text-right mb-6">
                    <button 
                        type="button"
                        onClick={switchToForgotPassword} 
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        Forgot Password?
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:bg-blue-300 flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner small /> : 'Log In'}
                    </button>
                </div>
            </form>
            <p className="text-center text-gray-600 text-sm mt-6">
                Don't have an account?{' '}
                <button onClick={switchToSignup} className="font-bold text-blue-600 hover:text-blue-800">
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default LoginForm;
