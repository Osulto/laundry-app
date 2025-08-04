import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBc3DSf2ev1Zfbp9IvhpOv2tmptcEx9GFY",
  authDomain: "secdev-7753c.firebaseapp.com",
  projectId: "secdev-7753c",
  storageBucket: "secdev-7753c.firebasestorage.app",
  messagingSenderId: "966652785979",
  appId: "1:966652785979:web:d0e00548b7d5d77134b31e",
  measurementId: "G-952C8J7S47"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
