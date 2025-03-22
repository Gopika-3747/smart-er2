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
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://localhost:5000/graph-data');
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchGraphData();
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
  const chartData = {
    labels: graphData ? graphData.hours : [],
    datasets: [
      {
        label: 'Patient Count',
        data: graphData ? graphData.patient_counts : [],
        borderColor: 'rgb(15, 57, 223)',
        backgroundColor: 'rgba(1, 23, 188, 0.2)',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(49, 9, 229)',
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Patient Count Over Time - ${new Date().toISOString().split('T')[0]}`,
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (Hours)',
        },
        grid: { display: true },
      },
      y: {
        title: {
          display: true,
          text: 'Patient Count',
        },
        min: 0,  // Explicitly set the minimum value of the y-axis
        max: 20, // Explicitly set the maximum value of the y-axis
        ticks: {
          stepSize: 4,  // Ensure the scale increments by 1
          callback: (value) => {
            if (value % 1 === 0) {  // Only display whole numbers
              return value;
            }
          },
        },
        grid: { display: true },
      },
    },
  };
  

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
                {graphData ? (
                  <Line data={chartData} options={chartOptions} style={{ width: '200%', height: '400px' }} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-500">Loading graph...</span>
                  </div>
                )}
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