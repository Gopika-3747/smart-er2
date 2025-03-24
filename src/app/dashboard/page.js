'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [graphData, setGraphData] = useState(null);
  const [metrics, setMetrics] = useState({
    currentPatients: 0,
    maxbed: 20,
    bedAvailability: 0,
    erStatus: 'Moderate',
    staffAvailability: 'High',
  });

  // Fetch graph data from the backend
  useEffect(() => {
    const fetchGraph = () => {
      fetch('http://localhost:5003/graph')
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch((error) => console.error('Error fetching graph:', error));
    };
  
    // Fetch the graph immediately
    fetchGraph();
  
    // Refresh the graph every 5 seconds
    const interval = setInterval(fetchGraph, 5000);
  
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAdmittedPatients = async () => {
      try {
        const response = await fetch('http://localhost:5002/admitted-patients');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          currentPatients: data.num_admitted_patients,
          bedAvailability: prevMetrics.maxbed - data.num_admitted_patients,
        }));
      } catch (error) {
        console.error('Error fetching admitted patients:', error);
      }
    };

    fetchAdmittedPatients();
  }, []);

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

  // Chart.js data configuration
  

  // Chart.js options

  

  return (
    <div className="min-h-screen bg-opacity-85 backdrop-blur-sm bg-blue-100 overflow-x-hidden">
      <div className="flex min-h-screen w-full  flex-wrap">

        <Sidebar />

        {/* Main Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />

          <div className="px-6 mt-4">
            <h2 className="text-gray-600 font-bold text-[clamp(1.4rem,2vw,1.9rem)]">ER Dashboard</h2>
          </div>

          {/* Stats Section */}
          <div className="opacity-85 text-black p-6 flex justify-evenly items-center flex-wrap gap-4">
            {[
              { name: 'Current ER Patients', value: metrics.currentPatients, bg: 'bg-gray-100' },
              { name: 'Bed Availability', value: metrics.bedAvailability,bg: 'bg-gray-100' },
              { name: 'ER Status', value: metrics.erStatus ,bg: 'bg-gray-100'},
              { name: 'Staff Availability', value: metrics.staffAvailability ,bg: 'bg-gray-100'},
            ].map((item, index) => (
              <div
                key={index}
                className={`${item.bg} flex flex-col gap-2 border-y-8 border-red-400 h-[clamp(150px,15vh,300px)] w-[clamp(150px,15vw,300px)] justify-between items-center p-6 rounded-2xl shadow-xl`}
              >
                <span className="text-[clamp(1rem,2vw,1.1rem)] text-center font-medium">{item.name}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="p-6 grid grid-cols-3 gap-4">
            {/* ER Trends */}
            <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-xl font-bold mb-4">ER TRENDS</h2>
              <div className="h-[250px]">
              <div>
              <h1>Hourly Patient Count Graph</h1>
              {imageUrl && <img src={imageUrl} alt="Hourly Patient Count Graph" />}
              </div>
                
              </div>
            </div>

          {/* Patient Details Section */}
          <div className="p-6 w-full">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">Patient Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      {['Patient ID', 'Hospital ID', 'Urban/Rural', 'Gender', 'Age', 'Blood Group', 'Triage Level', 'Factor', 'Entry Date', 'Entry Time', 'Leave Date', 'Leave Time'].map((heading) => (
                        <th key={heading} className="p-2 border">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="12" className="text-center py-4 text-gray-500">No data available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;
