// firebase.js
// Import Firebase core and services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCi-Hv05dqr5u00wYKHmCT1bRbUIVsS8wQ",
  authDomain: "mindbursttvofficial.firebaseapp.com",
  projectId: "mindbursttvofficial",
  storageBucket: "mindbursttvofficial.appspot.app",
  messagingSenderId: "721530478936",
  appId: "1:721530478936:web:bf6362002a35688b99052d",
  measurementId: "G-M889E0KWTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
