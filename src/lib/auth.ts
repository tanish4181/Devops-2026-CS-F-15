import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import type { User, UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const signup = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const login = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const logout = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getSession = (): User | null => auth.currentUser;

export const isAdmin = (user: User | null = getSession()): boolean => {
  return Boolean(user);
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  return await signInWithPopup(auth, new GoogleAuthProvider());
};