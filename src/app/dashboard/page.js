'use client';

import React from 'react';
import { useRouter } from 'next/navigation';


const Dashboard = () => {
  const router = useRouter();

  // Dummy logout function
  const handleLogout = () => {
    alert('Logged out successfully!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Navbar */}
      <header className="bg-blue-700 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">ER Management Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-blue-800 mb-6">Welcome to the Dashboard!</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Dummy Cards */}
          {['Patients', 'Staff Management', 'Reports', 'Emergency Cases', 'Analytics', 'Settings'].map((item, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{item}</h3>
              <p className="text-gray-500">
                This section will provide details and management tools for {item.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          © {new Date().getFullYear()} ER Management Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
