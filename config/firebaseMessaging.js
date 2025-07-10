// firebaseMessaging.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyCi-Hv05dqr5u00wYKHmCT1bRbUIVsS8wQ",
  authDomain: "mindbursttvofficial.firebaseapp.com",
  projectId: "mindbursttvofficial",
  storageBucket: "mindbursttvofficial.firebasestorage.app",
  messagingSenderId: "721530478936",
  appId: "1:721530478936:web:bf6362002a35688b99052d",
  measurementId: "G-M889E0KWTT",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
