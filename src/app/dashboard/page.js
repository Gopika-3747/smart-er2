'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();


  const [userName, setUserName] = useState('User');
  const [hospitalName, setHospitalName] = useState('Hospital');

  // ✅ Fix: Access localStorage only after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('userName') || 'User');
      setHospitalName(localStorage.getItem('hospitalName') || 'Hospital');
    }
  }, []);


  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-blue-800">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-opacity-50 backdrop-blur-sm bg-blue-100">

     {/* Top Navbar */}
    <div>
     <Navbar/>
    </div>

     <div className='flex m-3'> 
      <Sidebar />
      
      {/* Main Section */}
      <div className="flex-1 flex flex-col">
      <div className="bg-yellow-300 text-white p-4 flex justify-evenly rounded-bl-lg rounded-br-lg">
          {['Current ER Patients', 'Bed Availability', 'ER Status', 'Staff Availability'].map((item, index) => (
            <button
              key={index}
              className="border border-white px-4 py-2 rounded-md bg-opacity-20 hover:bg-opacity-40 transition"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {/* ER Trends */}
          <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-blue-800 text-xl font-bold mb-4">ER TRENDS</h2>
            <div className="h-[250px] bg-gray-200 rounded-lg flex items-center justify-center">
              {/* Placeholder for Chart */}
              <span className="text-gray-500">[Graph will be rendered here]</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-blue-800 text-xl font-bold mb-4">Notifications</h2>
            <div className="h-[250px] bg-gray-100 rounded-lg p-2">
              <p className="text-gray-500 text-sm">
                - No new notifications.
              </p>
            </div>
          </div>

          {/* Staff Scheduling */}
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-blue-800 text-xl font-bold mb-4">Staff Scheduling</h2>
            <div className="h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
              {/* Placeholder for Scheduling */}
              <span className="text-gray-500">[Staff schedule details]</span>
            </div>
          </div>
        </div>
        </div>

      </div>
       {/* Footer */}
       <footer className="bg-gray-800 text-white text-center py-3">
          © {new Date().getFullYear()} ER Management Portal. All rights reserved.
        </footer>
    </div>
  );
};

export default Dashboard;