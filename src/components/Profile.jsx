import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserComplaints } from '../backend/getComplaints';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userDocRef = doc(db, 'Users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          if (userData.role === 'admin') {
            navigate('/admin-profile');
            return;
          }

          setName(userData.name || user.email);
          const userComplaints = await getUserComplaints(user.uid);
          setComplaints(userComplaints);
        } else {
          setName(user.email);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleResetPassword = () => {
    if (user?.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => alert('Password reset email sent!'))
        .catch(err => alert('Error: ' + err.message));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white text-black rounded-2xl shadow-2xl p-6 sm:p-10 relative">
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-black hover:bg-zinc-700 text-white px-4 py-2 rounded-full shadow-md transition duration-200"
        >
          Logout
        </button>

        {/* Welcome Header */}
        <div className="text-center border-b pb-6 mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome, {name}</h2>
        </div>

        {/* User Info */}
        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <div className="bg-gray-100 rounded-lg p-6 shadow-inner">
            <p className="text-sm font-semibold text-black mb-1">Full Name</p>
            <p className="text-xl font-bold text-gray-900 break-words">{name}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 shadow-inner">
            <p className="text-sm font-semibold text-black mb-1">Email Address</p>
            <p className="text-xl font-bold text-gray-900 break-words">{user?.email}</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="text-center mb-10">
          <button
            onClick={handleResetPassword}
            className="bg-black hover:bg-zinc-700 text-white px-6 py-2 rounded-full shadow-md transition duration-200"
          >
            Change Password
          </button>
        </div>

        {/* Complaint List */}
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-center">My Complaints</h3>

        {complaints.length === 0 ? (
          <p className="text-center text-gray-600">You have not submitted any complaints yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded-xl">
              <thead className="bg-gray-200 text-black">
                <tr>
                  <th className="py-2 px-4 border">#</th>
                  <th className="py-2 px-4 border">Title</th>
                  <th className="py-2 px-4 border">Description</th>
                  <th className="py-2 px-4 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, index) => (
                  <tr key={c.id} className="border-t hover:bg-gray-100 transition">
                    <td className="py-2 px-4 border text-black text-center">{index + 1}</td>
                    <td className="py-2 px-4 border text-black">{c.title}</td>
                    <td className="py-2 px-4 border text-black whitespace-pre-wrap break-words max-w-md">
                      {c.description}
                    </td>
                    <td className="py-2 px-4 border font-semibold text-black text-center">
                      <span className={
                        c.status === 'Pending' ? 'text-yellow-500' :
                        c.status === 'In Progress' ? 'text-orange-500' :
                        'text-green-600'
                      }>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

