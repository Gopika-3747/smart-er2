"use client";
import Sidebar from '../components/sidebar';
import React, { useEffect, useState } from 'react';
import { FaChartLine, FaSyncAlt, FaCalendarAlt, FaDownload } from "react-icons/fa";
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
import Navbar from '../components/navbar';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Predictions = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState([
    { id: 1, category: "ER Load", value: "High", color: "bg-red-500" },
    { id: 2, category: "Critical Cases", value: "Moderate", color: "bg-yellow-500" },
    { id: 3, category: "Bed Availability", value: "Low", color: "bg-green-500" },
  ]);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  const fetchGraph = (month) => {
    setIsLoading(true);
    fetch(`http://localhost:5005/predict-graph?month=${month}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching graph:', error);
        setIsLoading(false);
      });
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ER_Predictions_${months.find(m => m.value === selectedMonth)?.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchGraph(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
  };

  const handleRefresh = () => {
    fetchGraph(selectedMonth);
  };

  return (
    <div className="min-h-screen bg-opacity-80 backdrop-blur-sm bg-blue-100 ">
      <Navbar/>
      <div className="flex min-h-screen w-full flex-wrap">
      <Sidebar />
      
      <div className="flex-1 mt-7 ml-3 mr-1">
        {/* Header */}
        <div className="flex justify-between items-center p-3 drop-shadow-lg ">
          <h1 className="flex items-center text-gray-600 font-bold text-[clamp(1.5rem,3vw,2rem)]">
            <FaChartLine className="mr-2"/> ER Predictions
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className='text-black text-xl'/>
              <select 
                value={selectedMonth}
                onChange={handleMonthChange}
                className="bg-blue-100 text-gray-800 px-3 py-3 rounded-md outline-none focus:outline-none"
              > 
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-opacity-60 rounded-md shadow-md"
                onClick={handleRefresh}
              >
                <FaSyncAlt /> Refresh
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-opacity-60 rounded-md shadow-md disabled:opacity-50"
                onClick={handleDownload}
                disabled={!imageUrl || isLoading}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="my-6 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Prediction Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prediction Cards */}
            <div className="space-y-4 mt-20">
              {predictions.map((item) => (
                <div key={item.id} className={`p-4 text-white rounded-lg ${item.color} shadow-md`}>
                  <h3 className="text-lg font-semibold">{item.category}</h3>
                  <p className="text-xl">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Graph Section */}
            <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-blue-800 text-xl font-bold">
                  ER TRENDS - {months.find(m => m.value === selectedMonth)?.name}
                </h2>
                {imageUrl && (
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    title="Download Graph"
                  >
                    <FaDownload /> Export
                  </button>
                )}
              </div>
              <div className="w-full h-[500px] overflow-hidden flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
                    <p className="mt-2 text-blue-800">Loading graph...</p>
                  </div>
                ) : imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`Hourly Patient Count Graph for ${months.find(m => m.value === selectedMonth)?.name}`} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-red-500">No graph data available for selected month</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Predictions;