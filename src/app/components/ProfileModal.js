'use client';

import React from 'react';

const ProfileModal = ({ isOpen, onClose, userDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-top justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl mt-32 h-48 w-[90%] max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl">
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-blue-900">User Profile</h2>

        <div className="space-y-2 text-gray-700 text-sm">
          <p><span className="font-semibold">Name:</span> {userDetails.userName}</p>
          <p><span className="font-semibold">User ID:</span> {userDetails.userID || 'N/A'}</p>
          <p><span className="font-semibold">Role:</span> {userDetails.role || 'Medical Staff'}</p>
          <p><span className="font-semibold">Hospital:</span> {userDetails.hospitalName}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
