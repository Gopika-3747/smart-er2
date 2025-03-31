"use client";
const Sidebar = React.lazy(() => import('../components/sidebar'));
const Navbar = React.lazy(()=>import('../components/navbar'));


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
    <div className="min-h-screen p-6 bg-gray-100 flex flex-wrap">
        
        <Sidebar/>
        
        
      {/* Header */}
      <div>
      <Navbar/>
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold flex items-center">
          <FaBell className="mr-2" /> Notifications
        </h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-md shadow-md"
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
  );
};

export default Notifications;
