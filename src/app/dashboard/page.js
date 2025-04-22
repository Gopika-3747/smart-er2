'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';

import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  
  const [metrics, setMetrics] = useState({
    currentPatients: 0,
    maxbed: 100,
    bedAvailability: 0,
    erStatus: 'Moderate',
    Critical_percentage: 0,
  });

  const [showPopup1, setShowPopup1] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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

  const fetchGraph = () => {
    fetch('http://localhost:5001/graph')
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((error) => console.error('Error fetching graph:', error));
  };

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(fetchGraph, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdmittedPatients = async () => {
    try {
      const response = await fetch('http://localhost:5001/admitted-patients');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      setMetrics(prev => ({
        ...prev,
        currentPatients: data.num_admitted_patients,
        bedAvailability: prev.maxbed - data.num_admitted_patients,
        erStatus: calculateErStatus(data.num_admitted_patients, prev.maxbed),
        Critical_percentage:((data.num_critical_patients/data.num_admitted_patients ))
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCurrentPatients = async () => {
    try {
      const response = await fetch('http://localhost:5001/list');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setPatients(data.current_patients || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleDischarge = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5001/discharge/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      await Promise.all([fetchGraph(), fetchCurrentPatients(), fetchAdmittedPatients()]);
      
      setPopupMessage('Patient discharged successfully!');
      setShowPopup1(true);
      setTimeout(() => setShowPopup1(false), 3000);
    } catch (error) {
      console.error('Error:', error);
      setPopupMessage(error.message || 'Failed to discharge patient');
      setShowPopup1(true);
      setTimeout(() => setShowPopup1(false), 3000);
    }
  };

  useEffect(() => {
    fetchAdmittedPatients();
    fetchCurrentPatients();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex bg-blue-50 items-center justify-center">
      <div className="text-2xl font-semibold text-[#245370]">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) return null;

  const getBoxColor = (metricName, value) => {
    switch (metricName) {
      case 'Current ER Patients':
        return value >= 15 ? 'border-red-500' : value >= 10 ? 'border-yellow-400' : 'border-green-500';
      case 'Bed Availability':
        return value <= 5 ? 'border-red-500' : value <= 10 ? 'border-yellow-400' : 'border-green-500';
      case 'ER Status':
        return value === 'High' ? 'border-red-500' : value === 'Moderate' ? 'border-yellow-400' : 'border-green-500';
      case 'Critical Percentage':
        return value >=75 ? 'border-red-500' : value <= 25 ? 'border-yellow-400' : 'border-green-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <>
      {showPopup1 && (
        <div className="fixed bottom-4 right-32 left-32 bg-green-100 text-green-500 p-2 rounded-lg shadow-md animate-slide-in z-50">
          {popupMessage}
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
              <h2 className="text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)]">ER Dashboard</h2>
            </div>
        
            <div className="opacity-95 text-black p-6 flex justify-evenly items-center flex-wrap gap-4">
              {[
                { name: 'Current ER Patients', value: metrics.currentPatients },
                { name: 'Bed Availability', value: metrics.bedAvailability },
                { name: 'ER Status', value: metrics.erStatus },
                { name: 'Critical Percentage', value: metrics.Critical_percentage.toFixed(2)+"%" },
              ].map((item, index) => (
                <div key={index} className={`hover:shadow-2xl shadow-lg ${getBoxColor(item.name, item.value)} bg-[#fffeef] flex flex-col gap-2 border-t-[12px] transform transition duration-300 ease-in-out hover:scale-[1.1] h-[clamp(150px,15vh,300px)] w-[clamp(150px,15vw,300px)] justify-between items-center p-6 rounded-3xl rounded-t-none shadow-xl`}>
                  <span className="text-[clamp(1rem,2vw,1.1rem)] text-center font-medium">{item.name}</span>
                  <span className="text-lg font-bold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-6 w-full">
              <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">ER TRENDS</h2>
                <div className="h-[500px]">
                  {imageUrl && <img src={imageUrl} alt="Hourly Patient Count Graph" />}
                </div>
              </div>

              <div className="p-6 w-full">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">Patient Details</h2>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm border-collapse border-4 border-gray-500">
                      <thead>
                        <tr className="bg-gray-100 sticky top-0">
                          {['Patient ID', 'Hospital ID', 'Urban/Rural', 'Gender', 'Age', 'Blood Group', 'Triage Level', 'Factor', 'Entry Date', 'Entry Time', 'Action'].map((heading) => (
                            <th key={heading} className="p-2 border-2 whitespace-nowrap">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loadingPatients ? (
                          <tr><td colSpan="12" className="text-center py-4">Loading patient data...</td></tr>
                        ) : patients.length === 0 ? (
                          <tr><td colSpan="12" className="text-center py-4 text-gray-500">No patients currently admitted</td></tr>
                        ) : (
                          patients.map((patient) => (
                            <tr key={patient.Patient_ID} className="hover:bg-gray-50">
                              <td className="p-2 border-2">{patient.Patient_ID}</td>
                              <td className="p-2 border-2">{patient.Hospital_ID}</td>
                              <td className="p-2 border-2">{patient.Urban_Rural}</td>
                              <td className="p-2 border-2">{patient.Gender}</td>
                              <td className="p-2 border-2">{patient.Age}</td>
                              <td className="p-2 border-2">{patient.Blood_Group}</td>
                              <td className="p-2 border-2">{patient.Triage_Level}</td>
                              <td className="p-2 border-2">{patient.Factor}</td>
                              <td className="p-2 border-2">{patient.Entry_Date}</td>
                              <td className="p-2 border-2">{patient.Entry_Time}</td>
                              <td className="p-2 border-2">
                                <button
                                  onClick={() => handleDischarge(patient.Patient_ID)}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                  Discharge
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;