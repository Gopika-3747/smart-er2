'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
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
  
  const [metrics, setMetrics] = useState({
    currentPatients: 0,
    maxbed: 20,
    bedAvailability: 0,
    erStatus: 'Moderate',
    staffAvailability: 'High',
  });

  const calculateErStatus = (currentPatients, maxCapacity) => {
    const percentage = (currentPatients / maxCapacity) * 100;
    
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    return 'Low';
  };

  useEffect(() => {
    const fetchGraph = () => {
      fetch('http://localhost:5001/graph')
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
  }, []);

  const fetchAdmittedPatients = async () => {
    try {
      const response = await fetch('http://localhost:5001/admitted-patients');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
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
    fetchAdmittedPatients();
  }, []);

  const fetchCurrentPatients = async () => {
    try {
      const response = await fetch('http://localhost:5001/list');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPatients(data.current_patients || []);
    } catch (error) {
      console.error('Error fetching current patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchCurrentPatients();
  }, []);

  const handleDischarge = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5001/discharge/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchCurrentPatients();
      await fetchAdmittedPatients();

      alert('Patient discharged successfully!');
    } catch (error) {
      console.error('Error discharging patient:', error);
      alert('Failed to discharge patient.');
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
        if (value === 'Low') return 'border-green-300';
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
    <div className="min-h-screen bg-opacity-80 backdrop-blur-sm bg-blue-100 overflow-hidden">
      <Navbar />
      <div className="flex min-h-screen mt-20 w-full flex-wrap">
        <Sidebar />
      
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 mt-4">
            <h2 className="text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)]">ER Dashboard</h2>
          </div>

          <div className="opacity-95 text-black p-6 flex justify-evenly items-center flex-wrap gap-4">
            {[
              { name: 'Current ER Patients', value: metrics.currentPatients },
              { name: 'Bed Availability', value: metrics.bedAvailability },
              { name: 'ER Status', value: metrics.erStatus},
              { name: 'Staff Availability', value: metrics.staffAvailability},
            ].map((item, index) => (
              <div
                key={index}
                className={` hover:shadow-2xl shadow-lg  ${getBoxColor(item.name, item.value)} bg-[#fffeef] flex flex-col gap-2 border-t-[12px] transform transition duration-300 ease-in-out hover:scale-[1.1] h-[clamp(150px,15vh,300px)] w-[clamp(150px,15vw,300px)] justify-between items-center p-6 rounded-3xl rounded-t-none shadow-xl`}
              >
                <span className="text-[clamp(1rem,2vw,1.1rem)] text-center font-medium">{item.name}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-6 w-full">
            <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">ER TRENDS</h2>
              <div className="h-[500px]">
                <div>{imageUrl && <img src={imageUrl} alt="Hourly Patient Count Graph" />}</div>
              </div>
            </div>

            <div className="p-6 w-full">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">Patient Details</h2>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200 sticky top-0">
                        {['Patient ID', 'Hospital ID', 'Urban/Rural', 'Gender', 'Age', 'Blood Group', 'Triage Level', 'Factor', 'Entry Date', 'Entry Time', 'Action'].map((heading) => (
                          <th key={heading} className="p-2 border whitespace-nowrap">
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPatients ? (
                        <tr>
                          <td colSpan="12" className="text-center py-4">
                            Loading patient data...
                          </td>
                        </tr>
                      ) : patients.length === 0 ? (
                        <tr>
                          <td colSpan="12" className="text-center py-4 text-gray-500">
                            No patients currently admitted
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
                          <tr key={patient.Patient_ID} className="hover:bg-gray-50">
                            <td className="p-2 border">{patient.Patient_ID}</td>
                            <td className="p-2 border">{patient.Hospital_ID}</td>
                            <td className="p-2 border">{patient.Urban_Rural}</td>
                            <td className="p-2 border">{patient.Gender}</td>
                            <td className="p-2 border">{patient.Age}</td>
                            <td className="p-2 border">{patient.Blood_Group}</td>
                            <td className="p-2 border">{patient.Triage_Level}</td>
                            <td className="p-2 border">{patient.Factor}</td>
                            <td className="p-2 border">{patient.Entry_Date}</td>
                            <td className="p-2 border">{patient.Entry_Time}</td>
                            <td className="p-2 border">
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
  );
};

export default Dashboard;