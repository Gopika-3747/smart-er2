// components/Notification.js
'use client';
import { useNotification } from '@/context/NotificationContext';
import { FaTimes, FaUserAlt, FaHospital, FaNotesMedical, FaClock } from 'react-icons/fa';

export default function Notification() {
  const { notifications, removeNotification } = useNotification();

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-l-4 border-green-500';
      case 'error': return 'bg-red-100 border-l-4 border-red-500';
      case 'new_patient': return 'bg-blue-100 border-l-4 border-blue-500';
      default: return 'bg-gray-100 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`p-4 rounded-r-lg shadow-lg w-80 ${getNotificationColor(notification.type)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
              
              {notification.patient && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <FaUserAlt className="text-blue-500" />
                    <span>ID: {notification.patient.Patient_ID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHospital className="text-blue-500" />
                    <span>Hospital: {notification.patient.Hospital_ID}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaNotesMedical className="text-blue-500" />
                    <span>Triage: {notification.patient.Triage_Level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaClock />
                    <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}