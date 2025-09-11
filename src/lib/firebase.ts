// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration will be populated here
const firebaseConfig = {
  apiKey: "AIzaSyDhctkmZcMkLNqz8rFVLHMiVdjpFUXKJtY",
  authDomain: "mold-manager-i7b2i.firebaseapp.com",
  projectId: "mold-manager-i7b2i",
  storageBucket: "mold-manager-i7b2i.firebasestorage.app",
  messagingSenderId: "279976860778",
  appId: "1:279976860778:web:57beba299d51d9a0e4be13"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
