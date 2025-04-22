'use client';

import React, { useState, useEffect } from 'react';
import { IoIosNotifications } from "react-icons/io";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5001/notifications', {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.notifications)) {
        throw new Error("Invalid notifications data format");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('http://localhost:5001/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }
      fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className=" rounded-full relative"
        disabled={loading}
      >
        <span className='mt-1 flex justify-center items-center rounded-full p-1'><IoIosNotifications size={30} className='hover:opacity-60 text-gray-800'/></span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {error && (
        <div className="absolute right-0 mt-2 w-72 bg-red-100 text-red-800 p-2 rounded-md">
          Error: {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-10 top-[-8px] mt-2 w-72 max-h-[199px] bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            {loading ? (
              <div className="px-4 py-2 text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;