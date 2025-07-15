import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config';
import { categorizeComplaint } from '../gemini';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupImage, setPopupImage] = useState(null);
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const categorizationPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        if (!data.createdAt) {
          data.createdAt = new Date();
        }

        if (!data.category || data.category === 'Other') {
          const aiCategory = await categorizeComplaint((data.title || '') + ' ' + (data.description || ''));
          await updateDoc(doc(db, 'complaints', id), { category: aiCategory });
          data.category = aiCategory;
        }

        if (!data.complaintId) {
          data.complaintId = id;
        }

        return { id, ...data };
      });

      const resolved = await Promise.all(categorizationPromises);
      const filtered = resolved.filter((c) => c.status !== 'Completed');

      filtered.sort((a, b) => {
        const priority = { 'Pending': 1, 'In Progress': 2, 'Completed': 3 };
        return priority[a.status] - priority[b.status];
      });

      setComplaints(filtered);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const docRef = doc(db, 'complaints', id);
      await updateDoc(docRef, { status });

      if (status === 'Completed') {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
      } else {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert("Failed to update status. See console.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout.");
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="min-h-screen bg-[#E6E6E9]">
      {/* NAVBAR */}
      <nav className="px-4 sm:px-7 py-4 sm:py-6 shadow-md flex flex-col sm:flex-row items-center sm:justify-between gap-4 bg-[#A5A9AE]">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="College Logo" className="h-10 w-auto" />
          <span className="text-xl sm:text-2xl font-extrabold text-black">CampusFix</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={handleChangePassword}
            className="text-black hover:underline px-4 py-2"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-10 text-[#393E41]">
          Admin Dashboard
        </h2>

        {loading ? (
          <div className="text-center text-gray-600 animate-pulse">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <p className="text-center text-gray-500">No complaints found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-xl">
            <table className="min-w-full text-sm sm:text-base bg-white rounded-lg overflow-hidden">
              <thead className="bg-sky-100 text-black">
                <tr>
                  <th className="py-3 px-2 sm:px-4">Complaint ID</th>
                  <th className="py-3 px-2 sm:px-4">Title</th>
                  <th className="py-3 px-2 sm:px-4">Description</th>
                  <th className="py-3 px-2 sm:px-4">Category</th>
                  <th className="py-3 px-2 sm:px-4">Proof</th>
                  <th className="py-3 px-2 sm:px-4">Status</th>
                  <th className="py-3 px-2 sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, index) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-sky-50 transition duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="py-3 px-2 sm:px-4 font-mono text-yellow-700 break-all">{c.complaintId}</td>
                    <td className="py-3 px-2 sm:px-4 font-semibold text-gray-800">{c.title}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 whitespace-normal break-words max-w-xs">
                      {c.description}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-blue-800 font-medium">{c.category}</td>
                    <td className="py-3 px-2 sm:px-4">
                      {c.imageUrl && (
                        <button
                          onClick={() => setPopupImage(c.imageUrl)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : c.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 flex flex-col sm:flex-row gap-2">
                      {c.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus(c.id, 'In Progress')}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition"
                        >
                          In Progress
                        </button>
                      )}
                      {(c.status === 'Pending' || c.status === 'In Progress') && (
                        <button
                          onClick={() => updateStatus(c.id, 'Completed')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-md transition"
                        >
                          Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP */}
      {popupImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
          onClick={() => setPopupImage(null)}
        >
          <div className="bg-white rounded-lg overflow-hidden shadow-xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <img
              src={popupImage}
              alt="Proof"
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
            <button
              onClick={() => setPopupImage(null)}
              className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
