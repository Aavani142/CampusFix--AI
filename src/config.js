import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 
const googleProvider = new GoogleAuthProvider();

// Google login
const handleGoogleLogin = async (setError) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In:", result.user);
    setError("");
  } catch (err) {
    console.error(err);
    setError("Google Sign-In failed");
  }
};

// Email login
const handleSubmit = async (e, setError, navigate) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const userDoc = await getDoc(doc(db, "Users", user.uid));
    if (!userDoc.exists()) {
      setError("User data not found.");
      return;
    }

    const role = userDoc.data().role;

    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/home");
    }

    setError("");
  } catch (error) {
    console.error("Login error:", error);
    if (error.code === "auth/user-not-found") {
      setError("No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
      setError("Password is incorrect.");
    } else {
      setError("Login failed. Please try again.");
    }
  }

  e.target.reset();
};


export {
  auth,
  db,
  storage, 
  googleProvider,
  handleGoogleLogin,
  handleSubmit
};




