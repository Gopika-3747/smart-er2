"use client";
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';


import {useEffect, useState } from "react";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  
  past.setHours(past.getHours());
  past.setMinutes(past.getMinutes());

  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours-5} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};


const Notifications = () => {
  // Mock notifications data
  const [hospitalId, setHospitalId] = useState("");
  const [notification, setNotification] = useState([]);

  useEffect(() => {
    const storedHospitalId = localStorage.getItem("hospitalID");
    if (storedHospitalId) {
      setHospitalId(storedHospitalId);
    }
  }, []);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5001/notifications?hospitalID=${hospitalId}`);
        const data = await res.json();

        const formatted = data.map((n, index) => ({
          ...n,
          id: `${n.timestamp}-${index}`,
          timeAgo: getTimeAgo(n.timestamp),
          color: "bg-blue-100",
        }));


        setNotification(formatted);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  // Function to clear notifications
  const clearNotifications = () => setNotification([]);

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
        {notification.length > 0 ? (
          <div className="space-y-4">
                {notification.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-4 text-blue-600 rounded-lg ${item.color} shadow-md`}>
                    <div className="flex items-center">
                    
                    <p className="text-lg">{item.message}</p>
                  </div>
                  <p className="text-sm ml-4 opacity-80">{item.timeAgo}</p>
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