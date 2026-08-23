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
  apiKey: "AIzaSyDhQPGu9KMHmds9BkLg9kDCDFIrRn_rh3Q",
  authDomain: "bugpilot-197cc.firebaseapp.com",
  projectId: "bugpilot-197cc",
  storageBucket: "bugpilot-197cc.firebasestorage.app",
  messagingSenderId: "452646893068",
  appId: "1:452646893068:web:8cc5dd11738c31af9aa029",
  measurementId: "G-M2X2N56SER"
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