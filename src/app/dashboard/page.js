'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import { HospitalContext } from '@/context/HospitalContext';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const { hospitalId } = useContext(HospitalContext);
  const [socket, setSocket] = useState(null);
  
  const [metrics, setMetrics] = useState({
    currentPatients: 0,
    maxbed: 20,
    bedAvailability: 0,
    erStatus: 'Moderate',
    staffAvailability: 'High',
  });

  const [showPopup1, setShowPopup1] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [relatedPatients, setRelatedPatients] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    if (!hospitalId) return;

    const newSocket = io('http://localhost:5001', {
      query: { hospital_id: hospitalId }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('register', { hospital_id: hospitalId });
    });

    newSocket.on('patient_update', (data) => {
      if (data.action === 'add') {
        setPopupMessage(`New patient admitted with Hospital ID ${hospitalId}`);
        setShowPopup1(true);
        setTimeout(() => setShowPopup1(false), 5000);
        fetchCurrentPatients();
      } else if (data.action === 'discharge') {
        setPopupMessage(`Patient discharged from Hospital ID ${hospitalId}`);
        setShowPopup1(true);
        setTimeout(() => setShowPopup1(false), 5000);
        fetchCurrentPatients();
      }
    });

    newSocket.on('initial_data', (data) => {
      if (data.hospital_id === hospitalId) {
        setPatients(data.patients);
      }
    });

    newSocket.on('data_update', (data) => {
      if (data.hospital_id === hospitalId) {
        setPatients(data.patients);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [hospitalId]);

  useEffect(() => {
    if (localStorage.getItem("justLoggedIn")) {
      setShowPopup(true);
      localStorage.removeItem("justLoggedIn");
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, []);

  const calculateErStatus = (currentPatients, maxCapacity) => {
    const percentage = (currentPatients / maxCapacity) * 100;
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    return 'Low';
  };

  useEffect(() => {
    const fetchGraph = () => {
      fetch(`http://localhost:5001/graph?hospital_id=${hospitalId}`)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch((error) => console.error('Error fetching graph:', error));
    };

    fetchGraph();
    const interval = setInterval(fetchGraph, 5000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  const fetchAdmittedPatients = async () => {
    try {
      const response = await fetch(`http://localhost:5001/admitted-patients?hospital_id=${hospitalId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      setMetrics((prevMetrics) => {
        const currentPatients = data.num_admitted_patients;
        const bedAvailability = prevMetrics.maxbed - currentPatients;
        const erStatus = calculateErStatus(currentPatients, prevMetrics.maxbed);
        
        return {
          ...prevMetrics,
          currentPatients,
          bedAvailability,
          erStatus
        };
      });
    } catch (error) {
      console.error('Error fetching admitted patients:', error);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchAdmittedPatients();
    }
  }, [hospitalId]);

  const fetchCurrentPatients = async () => {
    try {
      const response = await fetch(`http://localhost:5001/list?hospital_id=${hospitalId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setPatients(data.current_patients || []);
    } catch (error) {
      console.error('Error fetching current patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchCurrentPatients();
    }
  }, [hospitalId]);

  const showRelatedPatientsNotification = (hospitalId, action) => {
    const related = patients.filter(patient => 
      patient.Hospital_ID === hospitalId && 
      (patient.Leave_Date === 'NULL' || !patient.Leave_Date)
    );
    setRelatedPatients(related);
    
    if (related.length > 0) {
      setPopupMessage(`${action} patient with Hospital ID ${hospitalId}. ${related.length} other active patient(s) with same Hospital ID.`);
      setShowPopup1(true);
      setTimeout(() => {
        setShowPopup1(false);
        setRelatedPatients([]);
      }, 5000);
    }
  };

  const handleDischarge = async (patientId) => {
    try {
      const patient = patients.find(p => p.Patient_ID === patientId);
      if (!patient) throw new Error('Patient not found');
      
      const response = await fetch(`http://localhost:5001/discharge/${patientId}?hospital_id=${hospitalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      // Show notification for related patients
      showRelatedPatientsNotification(patient.Hospital_ID, 'Discharged');
      
      // Socket will handle the update via the patient_update event
    } catch (error) {
      console.error('Error discharging patient:', error);
      setPopupMessage('Failed to discharge patient.');
      setShowPopup1(true);
      setTimeout(() => setShowPopup1(false), 3000);
    }
  };

  const handleAdmitPatient = async (patientData) => {
    try {
      const response = await fetch('http://localhost:5001/add-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patientData, Hospital_ID: hospitalId })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      // Show notification for related patients
      showRelatedPatientsNotification(hospitalId, 'Admitted');
      return true;
    } catch (error) {
      console.error('Error admitting patient:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-blue-50 items-center justify-center">
        <div className="text-2xl font-semibold text-[#245370]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hospitalId) {
    return (
      <div className="min-h-screen flex bg-blue-50 items-center justify-center">
        <div className="text-2xl font-semibold text-[#245370]">
          Please select a Hospital ID to continue
        </div>
      </div>
    );
  }

  const getBoxColor = (metricName, value) => {
    switch (metricName) {
      case 'Current ER Patients':
        if (value >= 15) return 'border-red-500';
        if (value >= 10) return 'border-yellow-400';
        return 'border-green-500';
      case 'Bed Availability':
        if (value <= 5) return 'border-red-500';
        if (value <= 10) return 'border-yellow-400';
        return 'border-green-500';
      case 'ER Status':
        if (value === 'High') return 'border-red-500';
        if (value === 'Moderate') return 'border-yellow-400';
        if (value === 'Low') return 'border-green-500';
        return 'border-blue-500';
      case 'Staff Availability':
        if (value === 'Low') return 'border-red-500';
        if (value === 'Moderate') return 'border-yellow-400';
        if (value === 'High') return 'border-green-500';
        return 'border-blue-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <>
      {showPopup1 && (
        <div className="fixed bottom-4 right-32 left-32 bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md animate-slide-in z-50 flex flex-col">
          <div>{popupMessage}</div>
          {relatedPatients.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="font-semibold">Related Active Patients:</p>
              <ul className="list-disc pl-5">
                {relatedPatients.map((patient, index) => (
                  <li key={index}>
                    ID: {patient.Patient_ID}, {patient.Gender}, Age: {patient.Age}, Triage: {patient.Triage_Level}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {showPopup && (
        <div className="fixed text-[0.9rem] text-left bottom-2 rounded-lg right-3 left-3 bg-gray-800 text-gray-200 p-4 shadow z-50 transition-all transform ease-in-out duration-300">
          Successfully Logged In!
        </div>
      )}
      
      <div className="min-h-screen top-0 bg-opacity-80 backdrop-blur-sm bg-blue-100">
        <Navbar />
        <div className="flex min-h-screen mt-5 w-full flex-wrap">
          <Sidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 drop-shadow-lg">
              <h2 className="text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)]">
                ER Dashboard - Hospital ID: {hospitalId}
              </h2>
            </div>

            {/* ... rest of your existing JSX remains the same ... */}
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;