import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_firebase_apiKey,
    authDomain: process.env.NEXT_PUBLIC_firebase_authDomain,
    projectId: process.env.NEXT_PUBLIC_firebase_projectId,
    storageBucket: process.env.NEXT_PUBLIC_firebase_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_firebase_messagingSenderId,
    appId: process.env.NEXT_PUBLIC_firebase_appId,
    measurementId: process.env.NEXT_PUBLIC_firebase_measurementId,
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;