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

  // Fetch admitted patients data
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
        min: 0,
        max: 20,
        ticks: {
          stepSize: 2,
          callback: (value) => (value % 1 === 0 ? value : null),
        },
        grid: { display: true },
      },
    },
  };

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

          {/* Graph Section */}
          <div className="p-6 w-full">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-[clamp(0.8rem,10vw,1.3rem)] font-bold mb-4">ER Trends</h2>
              <div className="bg-gray-100 p-2 w-full h-72 sm:h-96">
                {graphData ? (
                  <Line data={chartData} options={chartOptions} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-500">Loading graph...</span>
                  </div>
                )}
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
