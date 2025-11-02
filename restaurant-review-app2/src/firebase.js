// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ← ADD THIS LINE

const firebaseConfig = {
  apiKey: "AIzaSyCtw9tTu99GJsbzPuXk-t1IukIOhd_WjuY",
  authDomain: "restaurant-review-app-28948.firebaseapp.com",
  projectId: "restaurant-review-app-28948",
  storageBucket: "restaurant-review-app-28948.firebasestorage.app",
  messagingSenderId: "263942312963",
  appId: "1:263942312963:web:91726d19d16af98ad76a36"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };