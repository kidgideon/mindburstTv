importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCi-Hv05dqr5u00wYKHmCT1bRbUIVsS8wQ",
  authDomain: "mindbursttvofficial.firebaseapp.com",
  projectId: "mindbursttvofficial",
  storageBucket: "mindbursttvofficial.firebasestorage.app",
  messagingSenderId: "721530478936",
  appId: "1:721530478936:web:bf6362002a35688b99052d",
  measurementId: "G-M889E0KWTT"
};

firebase.initializeApp(firebaseConfig); // <== THIS LINE WAS MISSING

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "../images/logo.png" // relative to /public
  });
});
