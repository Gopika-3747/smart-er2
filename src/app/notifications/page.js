"use client";
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';


import { useState } from "react";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const Notifications = () => {
  // Mock notifications data
  const [notifications, setNotifications] = useState([
    { id: 1, type: "alert", message: "Emergency room overload detected!", color: "bg-red-500", icon: <FaExclamationTriangle /> },
    { id: 2, type: "update", message: "New shift schedule available.", color: "bg-blue-500", icon: <FaInfoCircle /> },
    { id: 3, type: "reminder", message: "Patient check-up pending for Room 203.", color: "bg-yellow-500", icon: <FaBell /> },
  ]);

  // Function to clear notifications
  const clearNotifications = () => setNotifications([]);

  return (
    <div className="min-h-screen bg-opacity-80 backdrop-blur-sm bg-blue-100 ">
        <Navbar/>
      {/* Header */}
      <div className="flex min-h-screen w-full flex-wrap">
      <Sidebar />
      <div className="flex-1 ml-3 mr-1">
      <div className="flex-1 flex justify-between items-center overflow-hidden p-3 drop-shadow-xl">
      
        <h1 className="text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)] drop-shadow-lg mt-4"> Notifications
        </h1>
        <button 
          className="flex items-center gap-2 p-3 text-green-500 bg-green-100 hover:bg-blue-200 rounded-md shadow-md"
          onClick={clearNotifications}
        >
          <FaCheckCircle /> Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((item) => (
              <div key={item.id} className={`flex items-center p-4 text-white rounded-lg ${item.color} shadow-md`}>
                <span className="text-2xl mr-3">{item.icon}</span>
                <p className="text-lg">{item.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No new notifications</p>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default Notifications;
