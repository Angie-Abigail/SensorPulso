// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "fir-app2-6dc27.firebaseapp.com",
  databaseURL: "https://fir-app2-6dc27-default-rtdb.firebaseio.com",
  projectId: "fir-app2-6dc27",
  storageBucket: "fir-app2-6dc27.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Realtime Database
export const db = getDatabase(app);

//Inicializar Storage 
export const auth = getAuth(app);

//Inicializar Google Auth Provider : Autenticarte con correo y contraseña
export const googleProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
