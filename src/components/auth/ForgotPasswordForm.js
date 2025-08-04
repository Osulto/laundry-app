import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebase/config';
import { logger } from '../../utils/logger';

const ForgotPasswordForm = ({ switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [storedAnswerHash, setStoredAnswerHash] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const hashString = async (str) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(str.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Standardize the email to lowercase before looking it up
            const standardizedEmail = email.trim().toLowerCase();
            const questionDocRef = doc(db, "publicSecurityQuestions", standardizedEmail);
            const docSnap = await getDoc(questionDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setSecurityQuestion(data.question);
                setStoredAnswerHash(data.answerHash);
                setStep(2);
            } else {
                setError("No account found with this email address.");
                logger.auth('password_reset_email_check_failure', { success: false, userEmail: standardizedEmail, errorMessage: "Account not found" });
            }
        } catch (err) {
            console.error("Email check failed:", err);
            setError("Something went wrong while checking the email.");
            logger.error('password_reset_email_check_error', { success: false, userEmail: email, errorMessage: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
    
        try {
            const hashedInput = await hashString(securityAnswer);
    
            if (hashedInput === storedAnswerHash) {
                await sendPasswordResetEmail(auth, email.trim());
                setSuccess("A password reset email sent!");
                logger.auth('password_reset_success', { success: true, userEmail: email });
            } else {
                setError("Incorrect answer. Please try again.");
                logger.auth('password_reset_answer_failure', { success: false, userEmail: email, errorMessage: "Incorrect security answer" });
            }
        } catch (err) {
            console.error("Reset failed:", err);
            setError("Failed to send reset link.");
            logger.error('password_reset_send_error', { success: false, userEmail: email, errorMessage: err.message });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>

            {success ? (
                <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{success}</p>
            ) : (
                <>
                    {step === 1 ? (
                        <form onSubmit={handleEmailSubmit}>
                            <p className="text-center text-gray-600 text-sm mb-6">
                                Enter your email to proceed with password reset.
                            </p>
                            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 disabled:bg-blue-300"
                            >
                                {loading ? <LoadingSpinner small /> : 'Next'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="text-center text-gray-600 text-sm mb-6">
                                Answer your security question to receive a reset link.
                            </p>
                            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="security-answer">
                                    {securityQuestion}
                                </label>
                                <input
                                    id="security-answer"
                                    type="text"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 disabled:bg-blue-300"
                            >
                                {loading ? <LoadingSpinner small /> : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
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
