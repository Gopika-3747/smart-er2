"use client";
import { useState, useEffect } from "react";
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import { useNotification } from '../context/NotificationContext';
import { io } from 'socket.io-client';

const PatientEntry = () => {
  const [hospitalId, setHospitalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socket, setSocket] = useState(null);
  const { addNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    Patient_ID: "",
    Urban_Rural: "",
    Gender: "",
    Age: "",
    Blood_Group: "",
    Triage_Level: "",
    Factor: "",
    Entry_Date: "",
    Entry_Time: "",
    Leave_Date: "NULL",
    Leave_Time: "NULL",
  });

  // Initialize WebSocket connection and hospital ID
  useEffect(() => {
    // Get Hospital_ID from localStorage
    const storedHospitalId = localStorage.getItem("hospitalID");
    if (storedHospitalId) {
      setHospitalId(storedHospitalId);
    }

    // Setup WebSocket connection
    const newSocket = io('http://localhost:5001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (storedHospitalId) {
        newSocket.emit('register', { hospital_id: storedHospitalId });
      }
    });

    newSocket.on('patient_update', (data) => {
      if (data.hospital_id === storedHospitalId) {
        addNotification({
          type: 'info',
          message: data.message,
          patientData: data.patient
        });
      }
    });

    setSocket(newSocket);

    // Handle storage changes (for hospital ID updates)
    const handleStorageChange = (e) => {
      if (e.key === 'hospitalID') {
        const newHospitalId = e.newValue;
        setHospitalId(newHospitalId);
        if (newSocket) {
          newSocket.emit('register', { hospital_id: newHospitalId });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalId) {
      addNotification({
        type: 'error',
        message: 'Hospital ID not found. Please log in again.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const completeData = {
        ...formData,
        Hospital_ID: hospitalId,
      };

      const response = await fetch('http://localhost:5001/add-patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      const result = await response.json();

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Patient added successfully!'
        });
        
        // Reset form
        setFormData({
          Patient_ID: "",
          Urban_Rural: "",
          Gender: "",
          Age: "",
          Blood_Group: "",
          Triage_Level: "",
          Factor: "",
          Entry_Date: "",
          Entry_Time: "",
          Leave_Date: "NULL",
          Leave_Time: "NULL",
        });
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Failed to add patient'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format today's date as default for Entry_Date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, Entry_Date: today }));
  }, []);

  return (
    <div className="min-h-screen bg-opacity-80 backdrop-blur-sm bg-blue-100">
      <Navbar/>
      
      <div className="flex min-h-screen w-full flex-wrap">
        <Sidebar/>
        
        {/* Patient Entry Form Container */}
        <div className="flex-1 flex justify-center items-center p-6">
          <div className="w-full max-w-lg p-8 bg-green-50 shadow-xl rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Patient Entry Form
            </h2>
            
            {/* Display Hospital ID from localStorage */}
            {hospitalId && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-blue-800 font-medium">
                  Hospital ID: <span className="font-bold">{hospitalId}</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Patient ID*</label>
                  <input
                    type="text"
                    name="Patient_ID"
                    value={formData.Patient_ID}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Urban/Rural*</label>
                  <select
                    name="Urban_Rural"
                    value={formData.Urban_Rural}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Gender*</label>
                  <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Age*</label>
                  <input
                    type="number"
                    name="Age"
                    value={formData.Age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Blood Group*</label>
                  <select
                    name="Blood_Group"
                    value={formData.Blood_Group}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Triage Level*</label>
                  <select
                    name="Triage_Level"
                    value={formData.Triage_Level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Factor*</label>
                <input
                  type="text"
                  name="Factor"
                  value={formData.Factor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Entry Date*</label>
                  <input
                    type="date"
                    name="Entry_Date"
                    value={formData.Entry_Date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Entry Time*</label>
                  <input
                    type="time"
                    name="Entry_Time"
                    value={formData.Entry_Time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!hospitalId || isSubmitting}
                className={`w-full py-3 text-white font-semibold rounded-md transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : hospitalId 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : hospitalId ? (
                  "Submit Patient Entry"
                ) : (
                  "Hospital ID not found"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;