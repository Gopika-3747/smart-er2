// hooks/useHospitalSocket.js
import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

let socket;

export const useHospitalSocket = (onNotification) => {
  const connectSocket = useCallback(() => {
    const hospitalId = localStorage.getItem('hospitalID');
    if (!hospitalId) return;

    socket = io('http://localhost:5001', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to notification server');
      socket.emit('register', { 
        hospital_id: hospitalId 
      });
    });

    socket.on('new_patient', (data) => {
      console.log('New patient notification:', data);
      onNotification({
        type: 'new_patient',
        message: data.message,
        patient: data.patient,
        timestamp: data.timestamp
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [onNotification]);

  useEffect(() => {
    connectSocket();
    
    // Reconnect when hospital ID changes
    const handleStorageChange = (e) => {
      if (e.key === 'hospitalID') {
        if (socket) socket.disconnect();
        connectSocket();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (socket) socket.disconnect();
    };
  }, [connectSocket]);

  return { socket };
};