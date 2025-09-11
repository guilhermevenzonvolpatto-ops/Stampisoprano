// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration will be populated here
const firebaseConfig = {
  "projectId": "mold-manager-i7b2i",
  "appId": "1:279976860778:web:100c1cf4eb20b7d5e4be13",
  "storageBucket": "mold-manager-i7b2i.appspot.com",
  "apiKey": "AIzaSyDhctkmZcMkLNqz8rFVLHMiVdjpFUXKJtY",
  "authDomain": "mold-manager-i7b2i.firebaseapp.com",
  "messagingSenderId": "279976860778"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
