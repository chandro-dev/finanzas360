// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // o getFirestore para Firestore
import { firebaseConfig } from "./firebase.config";

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); // o getFirestore(app)
