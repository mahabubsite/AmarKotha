
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqz3rXdVJcmSbJCXMnzbug0zGqetJHc_o",
  authDomain: "amarkotha-d472a.firebaseapp.com",
  projectId: "amarkotha-d472a",
  storageBucket: "amarkotha-d472a.firebasestorage.app",
  messagingSenderId: "1051017810793",
  appId: "1:1051017810793:web:5b2cd705267cb9c033e3f8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
