"use client";
import Sidebar from '../components/sidebar';
import React, { useEffect, useState } from 'react';
import { FaChartLine, FaSyncAlt } from "react-icons/fa";
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

const Predictions = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [predictions, setPredictions] = useState([
    { id: 1, category: "ER Load", value: "High", color: "bg-red-500" },
    { id: 2, category: "Critical Cases", value: "Moderate", color: "bg-yellow-500" },
    { id: 3, category: "Bed Availability", value: "Low", color: "bg-green-500" },
  ]);

  useEffect(() => {
    const fetchGraph = () => {
      fetch('http://localhost:5005/predict-graph')
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

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 ml-4">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold flex items-center">
            <FaChartLine className="mr-2" /> ER Predictions
          </h1>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-md shadow-md"
            onClick={() => window.location.reload()}
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>

        {/* Main Content */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Prediction Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prediction Cards */}
            <div className="space-y-4">
              {predictions.map((item) => (
                <div key={item.id} className={`p-4 text-white rounded-lg ${item.color} shadow-md`}>
                  <h3 className="text-lg font-semibold">{item.category}</h3>
                  <p className="text-xl">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Graph - Now taking 2/3 of the width */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-blue-800 text-xl font-bold mb-4">ER TRENDS</h2>
              <div className="w-full h-[500px] overflow-hidden">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Hourly Patient Count Graph" 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;