import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

import { auth, db } from './firebase/config';
import useAuth from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/common/LoadingSpinner';

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
    const { user, loading } = useAuth();
    const [view, setView] = useState('login'); 

    const handleSignup = async (email, password, fullName, answer1, answer2) => {
        try {
            const hashedAnswer1 = await hashString(answer1);
            const hashedAnswer2 = await hashString(answer2);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            await updateProfile(newUser, { displayName: fullName });
            await setDoc(doc(db, "users", newUser.uid), {
                fullName: fullName,
                email: newUser.email,
                role: 'Customer',
                createdAt: new Date(),
                securityAnswers: { q1: hashedAnswer1, q2: hashedAnswer2 }
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
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const handlePasswordReset = async (email, answer1, answer2) => {
        try {
            // 1. Find the user by email
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, message: "No account found with that email address." };
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // 2. Hash the provided answers to compare them
            const hashedAnswer1 = await hashString(answer1);
            const hashedAnswer2 = await hashString(answer2);

            // 3. Securely compare the hashes
            if (hashedAnswer1 !== userData.securityAnswers?.q1 || hashedAnswer2 !== userData.securityAnswers?.q2) {
                return { success: false, message: "The security answers provided are incorrect." };
            }

            // 4. If answers match, send the reset email
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: "A password reset link has been sent to your email address." };

        } catch (error) {
            console.error("Password Reset Error:", error);
            return { success: false, message: "An unexpected error occurred. Please try again." };
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
                return <ForgotPasswordForm onReset={handlePasswordReset} switchToLogin={() => setView('login')} />;
            case 'login':
            default:
                return <LoginForm onLogin={handleLogin} switchToSignup={() => setView('signup')} switchToForgotPassword={() => setView('forgotPassword')} />;
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans p-4">
            {user ? (
                <DashboardPage user={user} onLogout={handleLogout} />
            ) : (
                renderAuthView()
            )}
        </div>
    );
}
