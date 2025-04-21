"use client";
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import { useState, useEffect } from "react";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/notifications');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          fetch('http://localhost:5001/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: notification._id })
          })
        )
      );
      fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setError(error.message);
    }
  };

  // Get notification icon and color based on type
  const getNotificationStyle = (type) => {
    switch(type) {
      case 'admission':
        return { 
          color: 'bg-blue-500',
          icon: <FaInfoCircle className="text-2xl mr-3" />
        };
      case 'discharge':
        return { 
          color: 'bg-green-500',
          icon: <FaCheckCircle className="text-2xl mr-3" />
        };
      case 'alert':
      default:
        return { 
          color: 'bg-red-500',
          icon: <FaExclamationTriangle className="text-2xl mr-3" />
        };
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-opacity-80 backdrop-blur-sm bg-blue-100">
      <Navbar/>
      <div className="flex min-h-screen w-full flex-wrap">
        <Sidebar />
        <div className="flex-1 ml-3 mr-1">
          <div className="flex-1 flex justify-between items-center overflow-hidden p-3 drop-shadow-xl">
            <h1 className="text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)] drop-shadow-lg mt-4">
              Notifications
            </h1>
            <button 
              className="flex items-center gap-2 p-3 text-green-500 bg-green-100 hover:bg-blue-200 rounded-md shadow-md"
              onClick={markAllAsRead}
              disabled={loading || notifications.length === 0}
            >
              <FaCheckCircle /> Mark all as read
            </button>
          </div>

          {/* Notifications List */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                Error: {error}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  return (
                    <div 
                      key={notification._id} 
                      className={`flex items-center p-4 text-white rounded-lg ${style.color} shadow-md`}
                    >
                      {style.icon}
                      <div>
                        <p className="text-lg">{notification.message}</p>
                        <p className="text-sm opacity-80">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {!notification.read && (
                          <span className="inline-block mt-1 text-xs bg-white text-black px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;