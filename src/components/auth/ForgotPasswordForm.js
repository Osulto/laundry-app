import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import LoadingSpinner from '../common/LoadingSpinner';
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from '../../firebase/config';



const ForgotPasswordForm = ({ onReset, switchToLogin, checkEmailExists }) => {
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [step, setStep] = useState(1); // 1 = email input, 2 = security question

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setCheckingEmail(true);
    
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email.trim()));
            const snapshot = await getDocs(q);
    
            if (snapshot.empty) {
                setError("No account found with this email.");
            } else {
                const userDoc = snapshot.docs[0];
                const userData = userDoc.data();
                setSecurityQuestion(userData.securityQuestion);
                setStep(2);
            }
        } catch (err) {
            console.error("Email check failed:", err);
            setError("Something went wrong while checking the email.");
        } finally {
            setLoading(false);
            setCheckingEmail(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
    
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email.trim()));
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                const userData = userDoc.data();
    
                const encoder = new TextEncoder();
                const data = encoder.encode(securityAnswer.toLowerCase().trim());
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashedInput = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
                if (hashedInput === userData.securityAnswerHash) {
                    await sendPasswordResetEmail(auth, email.trim());
                    setSuccess("Password reset email sent!");
                } else {
                    setError("Incorrect answer. Please try again.");
                }
            } else {
                setError("Email not found.");
            }
        } catch (err) {
            console.error("Reset failed:", err);
            setError("Failed to send reset link.");
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
                                disabled={checkingEmail}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center transition duration-300 disabled:bg-blue-300"
                            >
                                {checkingEmail ? <LoadingSpinner small /> : 'Next'}
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
