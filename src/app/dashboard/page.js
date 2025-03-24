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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [graphData, setGraphData] = useState(null);
  const [metrics, setMetrics] = useState({
    currentPatients: 0,
    maxbed:20, // Initialize with 0
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
        const response = await fetch('http://localhost:5002/admitted-patients'); // Ensure this matches the backend port
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMetrics((prevMetrics) => ({
          ...prevMetrics,
          currentPatients: data.num_admitted_patients,
          bedAvailability: metrics.maxbed-data.num_admitted_patients,
                    
        }));
      } catch (error) {
        console.error('Error fetching admitted patients:', error);
      }
    };
  
    fetchAdmittedPatients();
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-opacity-50 backdrop-blur-sm bg-blue-100">
      <div className="flex">
        <Sidebar />

        {/* Main Section */}
        <div className="flex-1 flex flex-col">
          <div>
            <Navbar />
          </div>

          <div>
            <h2 className="text-gray-600 font-sans font-bold text-[2rem]">ER Dashboard</h2>
          </div>

          <div className="opacity-85 text-black p-8 flex justify-between mr-6 m-3">
            {[
              { name: 'Current ER Patients', value: metrics.currentPatients, bg: 'bg-gray-200' },
              { name: 'Bed Availability', value: metrics.bedAvailability, bg: 'bg-gray-200' },
              { name: 'ER Status', value: metrics.erStatus, bg: 'bg-gray-200' },
              { name: 'Staff Availability', value: metrics.staffAvailability , bg: 'bg-gray-200' },
            ].map((item, index) => (
              <button
                key={index}
                className={`flex flex-col h-30 w-48 justify-between items-center p-8 rounded-2xl ${item.bg} transition-all duration-200 shadow-lg border-x-2 border-y-8 border-red-800 bg-[#fff9ac] backdrop-blur-xl`}
              >
                <span className="text-[1.1rem] font-medium">{item.name}</span>
                <span className="text-lg font-bold">{item.value}</span>
              </button>
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

            {/* Notifications */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-xl font-bold mb-4">Notifications</h2>
              <div className="h-[250px] bg-gray-100 rounded-lg p-2">
                <p className="text-gray-500 text-sm">- No new notifications.</p>
              </div>
            </div>

            {/* Staff Scheduling */}
            <div className="col-span-3 bg-white p-4 rounded-lg shadow-md mt-4">
              <h2 className="text-blue-800 text-xl font-bold mb-4">Patient Details</h2>
              <div className="h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">[Patient Details]</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-3">
        © {new Date().getFullYear()} ER Management Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;