import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db, storage, auth } from '../config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Reports() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category') || 'Other';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room: '',
    file: null,
    whichLab: '',
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'file' ? files[0] : value,
    }));
  };

  const generateComplaintId = () =>
    `CMP${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      Swal.fire('Error', 'Please login to submit a complaint.', 'error');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      if (formData.file) {
        const fileRef = ref(storage, `complaints/${Date.now()}_${formData.file.name}`);
        const uploadSnap = await uploadBytes(fileRef, formData.file);
        imageUrl = await getDownloadURL(uploadSnap.ref);
      }

      const complaintData = {
        complaintId: generateComplaintId(),
        userId: auth.currentUser.uid,
        category: selectedCategory,
        title: formData.title,
        description: formData.description,
        room:
          ['Hostel', 'Classroom', 'Lab Equipment'].includes(selectedCategory)
            ? formData.room
            : '',
        whichLab: selectedCategory === 'Lab Equipment' ? formData.whichLab : '',
        imageUrl,
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'complaints'), complaintData);

      Swal.fire(
        'Submitted!',
        `Your complaint under "${selectedCategory}" has been submitted.`,
        'success'
      );

      setFormData({
        title: '',
        description: '',
        room: '',
        file: null,
        whichLab: '',
      });
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error('Submission error:', err);
      Swal.fire('Error', 'Something went wrong while submitting.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-12 flex justify-center items-center">
      <div className="bg-white text-black rounded-xl shadow-xl p-6 w-full max-w-2xl sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-tektur mb-6 text-center">
          Report a Complaint - {selectedCategory}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">Subject</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md"
              placeholder="e.g., Broken plug in physics lab"
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-3 border rounded-md"
              placeholder="Explain the issue in detail..."
            />
          </div>

          {selectedCategory === 'Lab Equipment' && (
            <div>
              <label htmlFor="whichLab" className="block mb-1 font-medium">Which Lab?</label>
              <input
                id="whichLab"
                type="text"
                name="whichLab"
                value={formData.whichLab}
                onChange={handleChange}
                className="w-full p-3 border rounded-md"
                placeholder="e.g., Chemistry Lab"
              />
            </div>
          )}

          {['Hostel', 'Classroom', 'Lab Equipment'].includes(selectedCategory) && (
            <div>
              <label htmlFor="room" className="block mb-1 font-medium">Room No</label>
              <input
                id="room"
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full p-3 border rounded-md"
                placeholder="e.g., Room 302"
              />
            </div>
          )}

          <div>
            <label htmlFor="file" className="block mb-1 font-medium">
              Upload Proof (optional)
            </label>
            <input
              id="file"
              type="file"
              name="file"
              accept="image/*"
              onChange={handleChange}
              ref={fileInputRef}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition w-full sm:w-auto"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Reports;





