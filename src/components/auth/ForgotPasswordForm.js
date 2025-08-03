import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const ForgotPasswordForm = ({ onReset, switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [answer1, setAnswer1] = useState('');
    const [answer2, setAnswer2] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await onReset(email, answer1, answer2);

        if (result.success) {
            setSuccess(result.message);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
            
            {success ? (
                 <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{success}</p>
            ) : (
                <>
                    <p className="text-center text-gray-600 text-sm mb-6">
                        Enter your email and answer your security questions to receive a password reset link.
                    </p>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-email">
                                Email Address
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-q1">
                                What was the name of your first-grade teacher?
                            </label>
                            <input
                                id="reset-q1"
                                type="text"
                                value={answer1}
                                onChange={(e) => setAnswer1(e.target.value)}
                                className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-q2">
                               What is the name of the street you grew up on?
                            </label>
                            <input
                                id="reset-q2"
                                type="text"
                                value={answer2}
                                onChange={(e) => setAnswer2(e.target.value)}
                                className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 disabled:bg-blue-300 flex items-center justify-center"
                            >
                                {loading ? <LoadingSpinner small /> : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                </>
            )}

            <p className="text-center text-gray-600 text-sm mt-6">
                Remember your password?{' '}
                <button onClick={switchToLogin} className="font-bold text-blue-600 hover:text-blue-800">
                    Log In
                </button>
            </p>
        </div>
    );
};

export default ForgotPasswordForm;
