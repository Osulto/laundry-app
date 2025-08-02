import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in, now fetch their role from Firestore
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    // Combine auth data with Firestore data (like role)
                    setUser({ uid: currentUser.uid, ...currentUser, ...userDoc.data() });
                } else {
                    // This might happen if the Firestore doc creation fails after signup.
                    // We still set the user from auth, but they won't have a role.
                    setUser(currentUser);
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { user, loading };
};

export default useAuth;
