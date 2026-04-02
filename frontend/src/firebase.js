// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdyfLpLRtFOalk3I4L10Je19PJzITyVPk",
  authDomain: "e-commerse-5369f.firebaseapp.com",
  projectId: "e-commerse-5369f",
  storageBucket: "e-commerse-5369f.firebasestorage.app",
  messagingSenderId: "224142121340",
  appId: "1:224142121340:web:142275bbd3411e76afacf9",
  measurementId: "G-FMN70N4NJM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account", // Har baar account choose karne ka option dega
});

export { auth, googleProvider };
