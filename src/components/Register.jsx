import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../config";
import { setDoc, doc } from "firebase/firestore";

function Register() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Add User to Firestore
      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        name: name,
        role: email.toLowerCase() === "campusfix788@gmail.com" ? "admin" : "user",
      });

      // 3. Update User Profile
      await updateProfile(auth.currentUser, { displayName: name });

      // 4. Send Verification Email
      await sendEmailVerification(user);
      alert("Verification email sent. Please verify your email before logging in.");

      // Redirect to login
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[850px] h-[500px] bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Left panel */}
        <div className="relative w-1/2 h-full bg-gradient-to-br from-black via-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-white clip-left-shape z-10"></div>
          <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-3xl font-bold text-black">SIGN IN</h2>
            <Link
              to="/"
              className="inline-block mt-2 text-sm text-gray-700 font-medium hover:text-black transition"
            >
              LOGIN
            </Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-1/2 p-10 bg-white">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-16 h-16 mb-4" />

            <form className="w-full" onSubmit={handleRegister}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-full font-semibold transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {loading ? "Signing Up..." : "SIGN UP"}
              </button>

              {error && (
                <p className="text-red-500 text-center mt-3">{error}</p>
              )}
            </form>

            <p className="text-sm mt-4">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
