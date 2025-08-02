import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase/config';
import useAuth from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/common/LoadingSpinner';

// This utility function provides generic error messages,
// preventing attackers from knowing whether the username or password was wrong.
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
    const { user, loading } = useAuth();
    // This state is for toggling between the login and signup forms when the user is logged out.
    const [view, setView] = useState('login'); 

    const handleSignup = async (email, password, fullName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            
            // Update the user's profile in Firebase Auth
            await updateProfile(newUser, { displayName: fullName });
            
            // Create the user document in Firestore with the 'Customer' role
            await setDoc(doc(db, "users", newUser.uid), {
                fullName: fullName,
                email: newUser.email,
                role: 'Customer', // Role B: Default role for new signups
                createdAt: new Date()
            });
            
            return { success: true };
        } catch (error) {
            console.error("Signup Error:", error.code, error.message);
            return { success: false, message: getFriendlyAuthErrorMessage(error.code) };
        }
    };

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            return { success: false, message: getFriendlyAuthErrorMessage(error.code) };
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // The useAuth hook will automatically update the state, causing a re-render.
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Show a global loading spinner while we check for the user's auth state.
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
            {user ? (
                // If user is logged in, show the Dashboard
                <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
                // If no user, show either Login or Signup form
                <>
                    {view === 'login' ? (
                        <LoginForm onLogin={handleLogin} switchToSignup={() => setView('signup')} />
                    ) : (
                        <SignUpForm onSignup={handleSignup} switchToLogin={() => setView('login')} />
                    )}
                </>
            )}
        </div>
    );
}
