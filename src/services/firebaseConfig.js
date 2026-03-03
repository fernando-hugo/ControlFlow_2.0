import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // Adicionado para autenticação

const firebaseConfig = {
  apiKey: "AIzaSyAuitgMpMK4uHCOAYnInCbvCsO0mLROqIM",
  authDomain: "controlflow-2.firebaseapp.com",
  projectId: "controlflow-2",
  storageBucket: "controlflow-2.firebasestorage.app",
  messagingSenderId: "584088935763",
  appId: "1:584088935763:web:17de5be6b797f8e002d5a6",
  measurementId: "G-JWT397QNVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Instâncias Globais
export const db = getDatabase(app);
export const auth = getAuth(app); // Exportação necessária para o LoginAdmin