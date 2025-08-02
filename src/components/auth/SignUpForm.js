import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const SignUpForm = ({ onSignup, switchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic client-side validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setError('');
        setLoading(true);
        const result = await onSignup(email, password, fullName);
        if (!result.success) {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-fullname">
                        Full Name
                    </label>
                    <input
                        id="signup-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">
                        Email Address
                    </label>
                    <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">
                        Password
                    </label>
                    <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                    />
                     <p className="text-xs text-gray-500 mt-1">At least 8 characters, with uppercase, lowercase, and numbers.</p>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:bg-blue-300 flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner small /> : 'Sign Up'}
                    </button>
                </div>
            </form>
            <p className="text-center text-gray-600 text-sm mt-6">
                Already have an account?{' '}
                <button onClick={switchToLogin} className="font-bold text-blue-600 hover:text-blue-800">
                    Log In
                </button>
            </p>
        </div>
    );
};

export default SignUpForm;
