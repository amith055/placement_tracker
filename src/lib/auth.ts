import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

// 🔹 Sign up with Email
export const signupWithEmail = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  return user;
};

// 🔹 Login with Email
export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// 🔹 Google Login
export const signupWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// 🔹 Logout
export const logoutUser = async () => {
  await signOut(auth);
};