// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAJh5dClaUgdCZGAJFGUgG5Nb-o0VAgYf8",
  authDomain: "finanzas-aa.firebaseapp.com",
  projectId: "finanzas-aa",
  storageBucket: "finanzas-aa.firebasestorage.app",
  messagingSenderId: "518723190847",
  appId: "1:518723190847:web:4edbc14a49828e5419b88a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);