import React from 'react';
import { useNavigate } from 'react-router-dom';

function CategorySelection() {
  const navigate = useNavigate();

  const handleSelect = (category) => {
    navigate(`/reports?category=${encodeURIComponent(category)}`);
  };

  const categories = [
    'Ragging', 'Harassment', 'Hostel', 'Classroom',
    'Canteen', 'Wi-Fi', 'Washroom', 'Library',
    'Transport', 'Electricity', 'Water Supply', 'Cleanliness',
    'Security', 'Medical', 'Lab Equipment', 'Sports', 'Other',
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center font-tektur">
        Select Complaint Category
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleSelect(category)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelection;


