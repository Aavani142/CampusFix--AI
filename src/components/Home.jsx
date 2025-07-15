import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 text-white">
      
      {/* Navbar */}
      <nav className="bg-white/90 text-black p-4 md:p-5 flex justify-between items-center shadow-lg fixed w-full top-0 z-50">
        {/* Logo and Title */}
        <div className="flex items-center">
          <img src={logo} alt="CampusFix Logo" className="h-10 md:h-[3vw] w-auto mr-3 md:mr-4" />
          <span className="text-xl md:text-2xl font-extrabold">CampusFix</span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-4 md:gap-10 items-center text-sm md:text-base">
          <Link
            to="/about"
            className="hover:text-yellow-600 font-medium transition duration-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-yellow-600 font-medium transition duration-200"
          >
            Contact
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-1 hover:text-yellow-600 font-medium transition duration-200"
          >
            <FaUserCircle className="text-xl md:text-2xl" />
            Profile
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center pt-40 md:pt-48 pb-20 px-6">
        <h1 className="text-4xl md:text-6xl font-tektur font-bold mb-6 drop-shadow-md">
          Welcome to <span className="text-yellow-500">CampusFix</span>
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl">
          Raise complaints. Track reports. Stay informed. All in one place.
        </p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <Link
            to="/category-selection"
            className="bg-[#CFD1D4] hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition-all duration-200"
          >
            Report a Complaint
          </Link>
          <Link
            to="/chatbot"
            className="bg-[#CFD1D4] text-black hover:bg-yellow-400 px-6 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition-all duration-200"
          >
            Chat with AI
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Home;





