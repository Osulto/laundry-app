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

const checkEmailExists = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        return {
            exists: true,
            securityQuestion: userDoc.securityQuestion || 'What is your favorite color?',
        };
    }
    return { exists: false };
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

    const handleSignup = async (email, password, fullName, securityAnswer, selectedQuestion) => {
        try {
            const hashedAnswer = await hashString(securityAnswer);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            await updateProfile(newUser, { displayName: fullName });
            await setDoc(doc(db, "users", newUser.uid), {
                fullName: fullName,
                email: newUser.email,
                role: 'Customer',
                createdAt: new Date(),
                securityQuestion: selectedQuestion,
                securityAnswerHash: hashedAnswer
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

    const handlePasswordReset = async (email, securityAnswer) => {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);  // ✅ You missed this line before
    
            if (querySnapshot.empty) {
                return { success: false, message: "No account found with that email address." };
            }
    
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
    
            const hashedAnswer = await hashString(securityAnswer);
    
            if (hashedAnswer !== userData.securityAnswerHash) {
                return { success: false, message: "The security answer is incorrect." };
            }
    
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: "A password reset link has been sent to your email." };
    
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
                return <ForgotPasswordForm onReset={handlePasswordReset} switchToLogin={() => setView('login')} checkEmailExists={checkEmailExists} />;
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
