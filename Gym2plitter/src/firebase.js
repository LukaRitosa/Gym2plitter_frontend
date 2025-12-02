// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE6eCug90Qq5vigsZlMnKGiGenjelvO5Y",
  authDomain: "gym2plitter.firebaseapp.com",
  projectId: "gym2plitter",
  storageBucket: "gym2plitter.firebasestorage.app",
  messagingSenderId: "471226656520",
  appId: "1:471226656520:web:8cd347b8cc8c975601aebd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicijalizacija servisa
const auth = getAuth(app); // auth instanca
const db = getFirestore(app); // database instanca
// Izvoz servisa
export { auth, db };