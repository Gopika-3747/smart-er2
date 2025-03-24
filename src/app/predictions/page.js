
"use client";
import Sidebar from "../components/sidebar";


import { useState } from "react";
import { FaChartLine, FaSyncAlt } from "react-icons/fa";

const Predictions = () => {
  // Mock prediction data
  const [predictions, setPredictions] = useState([
    { id: 1, category: "ER Load", value: "High", color: "bg-red-500" },
    { id: 2, category: "Critical Cases", value: "Moderate", color: "bg-yellow-500" },
    { id: 3, category: "Bed Availability", value: "Low", color: "bg-green-500" },
  ]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold flex items-center">
          <FaChartLine className="mr-2" /> ER Predictions
        </h1>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-md shadow-md"
          onClick={() => console.log("Fetching new predictions...")}
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Predictions Table */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Prediction Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.map((item) => (
            <div key={item.id} className={`p-4 text-white rounded-lg ${item.color} shadow-md`}>
              <h3 className="text-lg font-semibold">{item.category}</h3>
              <p className="text-xl">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
