import React, { useState } from 'react';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ChangePasswordForm = ({ onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const user = auth.currentUser;
        const uid = user.uid;

        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        const lastChange = userDoc.exists() ? userDoc.data().lastPasswordChange?.toDate?.() : null;

        if (lastChange && Date.now() - lastChange.getTime() < 24 * 60 * 60 * 1000) {
            setError('You must wait at least 24 hours before changing your password again.');
            return;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!strongPasswordRegex.test(newPassword)) {
            setError('Password must contain at least one number, one uppercase and lowercase letter, and be at least 8 characters long.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password cannot be the same as the current password.');
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            await updateDoc(userDocRef, {
                lastPasswordChange: new Date(),
            });

            setSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            if (err.code === 'auth/invalid-credential') {
                setError('Current password is incorrect.');
            } else if (err.code === 'auth/weak-password') {
                setError('New password is too weak. Please choose a stronger password.');
            } else {
                setError('Failed to change password. Please try again.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
                >
                    &times;
                </button>
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                    </label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded p-2 mb-4"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded p-2 mb-4"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordForm;
