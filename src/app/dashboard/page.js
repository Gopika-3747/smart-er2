'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';

const Dashboard = () => {
 

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-[#245370]">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-opacity-50 backdrop-blur-sm bg-blue-100">

     <div className='flex'> 
      <Sidebar />
      
      {/* Main Section */}
      <div className="flex-1 flex flex-col">
      <div>
     <Navbar/>
    </div>

      <div>
        <h2 className='text-gray-600 font-sans font-bold text-[2rem]'>ER Dashboard</h2>
      </div>

      <div className=" opacity-85 text-black p-8 flex justify-between mr-6 m-3">
  {[
    { name: 'Current ER Patients', value: '24', bg: 'bg-gray-300' },
    { name: 'Bed Availability', value: '10', bg: 'bg-gray-300' },
    { name: 'ER Status', value: 'Moderate', bg: 'bg-gray-300' },
    { name: 'Staff Availability', value: 'High', bg: 'bg-gray-300' },
  ].map((item, index) => (
    <button
      key={index}
      className={`flex flex-col h-30 w-48 justify-between items-center p-8 rounded-2xl ${item.bg} transition-all duration-200 shadow-lg border-x-2 border-y-8 border-red-800 bg-[#fff9ac] backdrop-blur-xl `}
    >
      <span className="text-[1.1rem] font-medium">{item.name}</span>
      <span className="text-lg font-bold">{item.value}</span>
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