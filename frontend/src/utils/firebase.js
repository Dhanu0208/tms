// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "import.meta.env.VITE_FIREBASE_API_KEY",
  authDomain: "ticket-management-system-8e96e.firebaseapp.com",
  projectId: "ticket-management-system-8e96e",
  storageBucket: "ticket-management-system-8e96e.firebasestorage.app",
  messagingSenderId: "1016581815764",
  appId: "1:1016581815764:web:c0ae71bc8b459e6c5aea41",
  measurementId: "G-GYE31Q9DH9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
