import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration object with exact fallback credentials provided by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD2IupmXCw6qSpP-J0NBLohNUg9I2JmgTs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quotalo-37318.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quotalo-37318",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quotalo-37318.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "797814830044",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:797814830044:web:f631bbea95a9d503355519"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
