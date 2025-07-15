import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async (setError) => {
    setError("Google login not implemented yet.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      const data = userDoc.exists() ? userDoc.data() : null;

      if (data?.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl h-auto md:h-[500px] bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Left Panel */}
        <div className="relative md:w-1/2 w-full h-48 md:h-full bg-gradient-to-br from-black via-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-white clip-left-shape z-10"></div>
          <div className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black">LOGIN</h2>
            <Link
              to="/register"
              className="inline-block mt-2 text-sm text-gray-700 font-medium hover:text-black transition"
            >
              SIGN UP
            </Link>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="md:w-1/2 w-full p-6 md:p-10 bg-white">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <img src={logo} alt="CampusFix Logo" className="w-14 h-14" />
              {error && <p className="text-red-500 text-center mt-2 text-sm">{error}</p>}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-black mb-6">LOGIN</h2>

            <form className="w-full" onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="text-right mb-4">
                <a href="#" className="text-sm text-gray-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
              >
                LOGIN
              </button>
            </form>

            <div className="mt-6 text-sm text-gray-500">Or Login with</div>
            <div className="mt-2 flex gap-4">
              <button
                onClick={() => handleGoogleLogin(setError)}
                className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100"
              >
                <img
                  src="https://img.icons8.com/color/16/000000/google-logo.png"
                  alt="Google"
                />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



