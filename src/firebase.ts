import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAb6fniDpR2twbbYTdqNmhC9Mxw4tmCmGY",
    authDomain: "orquidea-c187e.firebaseapp.com",
    projectId: "orquidea-c187e",
    storageBucket: "orquidea-c187e.firebasestorage.app",
    messagingSenderId: "219126950013",
    appId: "1:219126950013:web:2cf3b5386f6515e14a6914",
    measurementId: "G-E852BLW94S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore
export const db = getFirestore(app);
