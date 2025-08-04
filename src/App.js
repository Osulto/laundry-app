import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from './firebase/config';
import useAuth from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { logger } from './utils/logger';

const hashString = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const getFriendlyAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid username and/or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email address already exists.';
        case 'auth/weak-password':
            return 'The password is too weak. Please choose a stronger password.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};

export default function App() {
    const [lastLoginInfo, setLastLoginInfo] = useState(null);
    const { user, loading } = useAuth();
    const [view, setView] = useState('login'); 

    const handleSignup = async (email, password, fullName, securityAnswer, selectedQuestion) => {
        try {
            const hashedAnswer = await hashString(securityAnswer);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            const standardizedEmail = email.toLowerCase(); // Standardize email to lowercase

            await updateProfile(newUser, { displayName: fullName });

            // Set private user data in 'users' collection
            await setDoc(doc(db, "users", newUser.uid), {
                fullName: fullName,
                email: standardizedEmail, // Store the standardized email
                role: 'Customer',
                createdAt: new Date(),
            });

            // Set public security question data using the standardized email as the document ID
            await setDoc(doc(db, "publicSecurityQuestions", standardizedEmail), {
                question: selectedQuestion,
                answerHash: hashedAnswer
            });

            logger.auth('signup_success', { success: true, userId: newUser.uid, userEmail: standardizedEmail });
            return { success: true };
        } catch (error) {
            logger.auth('signup_failure', { success: false, userEmail: email, errorMessage: error.message });
            return { success: false, message: getFriendlyAuthErrorMessage(error.code) };
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            const userId = loggedInUser.uid;
    
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const prevLoginInfo = userSnap.exists() ? userSnap.data().lastLoginAttempt : null;
    
            await updateDoc(userRef, {
                lastLoginAttempt: {
                    timestamp: serverTimestamp(),
                    success: true,
                }
            });
    
            logger.auth('login_success', { success: true, userId: userId, userEmail: email });
    
            setLastLoginInfo(prevLoginInfo ? {
                timestamp: prevLoginInfo.timestamp?.toDate ? prevLoginInfo.timestamp.toDate() : prevLoginInfo.timestamp,
                success: prevLoginInfo.success
              } : null);
    
            return { 
                success: true, 
                lastLogin: prevLoginInfo ? {
                    timestamp: prevLoginInfo.timestamp?.toDate ? prevLoginInfo.timestamp.toDate() : prevLoginInfo.timestamp,
                    success: prevLoginInfo.success
                } : null 
            };
      
        } catch (error) {
            logger.auth('login_failure', { success: false, userEmail: email, errorMessage: error.message });
            return { success: false, message: getFriendlyAuthErrorMessage(error.code) };
        }
    };

    const handleLogout = async () => {
        try {
            const userId = user?.uid;
            const userEmail = user?.email;
            await signOut(auth);
            logger.auth('logout_success', { success: true, userId, userEmail });
        } catch (error) {
            logger.auth('logout_failure', { success: false, userId: user?.uid, userEmail: user?.email, errorMessage: error.message });
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const renderAuthView = () => {
        switch(view) {
            case 'signup':
                return <SignUpForm onSignup={handleSignup} switchToLogin={() => setView('login')} />;
            case 'forgotPassword':
                return <ForgotPasswordForm switchToLogin={() => setView('login')} />;
            case 'login':
            default:
                return <LoginForm onLogin={handleLogin} switchToSignup={() => setView('signup')} switchToForgotPassword={() => setView('forgotPassword')} />;
        }
    }

    return (
        <ErrorBoundary>
            <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
                {user ? (
                    <DashboardPage user={user} onLogout={handleLogout} lastLoginInfo={lastLoginInfo} />
                ) : (
                    renderAuthView()
                )}
            </div>
        </ErrorBoundary>
    );
}
