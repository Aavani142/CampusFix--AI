import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { auth, db } from "../config";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log("Logged in user:", user.uid);
          const userDocRef = doc(db, "Users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("User data from Firestore:", userData);

            if (userData.role === "admin") {
              isMounted && setIsAdmin(true);
            } else {
              isMounted && setIsAdmin(false);
            }
          } else {
            console.warn("User document not found.");
            isMounted && setIsAdmin(false);
          }
        } else {
          console.log("No user logged in.");
          isMounted && setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error verifying admin role:", error);
        isMounted && setIsAdmin(false);
      } finally {
        isMounted && setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg animate-pulse">
        Checking admin access...
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;


