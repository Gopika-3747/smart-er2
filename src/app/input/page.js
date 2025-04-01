"use client";
import { useState, useEffect } from "react";

const PatientEntry = () => {
  // Default CSV content with headers
  const defaultCsvData = "Patient_ID,Hospital_ID,Urban_Rural,Gender,Age,Blood_Group,Triage_Level,Factor,Entry_Date,Entry_Time,Leave_Date,Leave_Time";
  const [csvData, setCsvData] = useState(defaultCsvData);
  const [hospitalId, setHospitalId] = useState("");
  
  const [formData, setFormData] = useState({
    Patient_ID: "",
    Urban_Rural: "",
    Gender: "",
    Age: "",
    Blood_Group: "",
    Triage_Level: "",
    Factor: "",
    Entry_Date: "",
    Entry_Time: "",
    Leave_Date: "",
    Leave_Time: "",
  });

  // Get Hospital_ID from localStorage on component mount
  useEffect(() => {
    const storedHospitalId = localStorage.getItem("hospitalID");
    if (storedHospitalId) {
      setHospitalId(storedHospitalId);
    }
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create the complete data object with Hospital_ID from localStorage
    const completeData = {
      ...formData,
      Hospital_ID: hospitalId,
    };

    // Append new data to the existing CSV
    const newRow = Object.values(completeData).join(",");
    const updatedCsv = `${csvData}\n${newRow}`;
    setCsvData(updatedCsv);

    // Download the updated CSV file
    downloadCSV(updatedCsv, "pat.csv");

    // Reset form after submission
    setFormData({
      Patient_ID: "",
      Urban_Rural: "",
      Gender: "",
      Age: "",
      Blood_Group: "",
      Triage_Level: "",
      Factor: "",
      Entry_Date: "",
      Entry_Time: "",
      Leave_Date: "NULL",
      Leave_Time: "NULL",
    });
  };

  // Helper function to trigger CSV download
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB]">
      {/* Patient Entry Form Container */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Patient Entry Form
          </h2>
          
          {/* Display Hospital ID from localStorage */}
          {hospitalId && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-blue-800 font-medium">
                Hospital ID: <span className="font-bold">{hospitalId}</span>
              </p>
            </div>
          )}

          {/* Form for New Entry */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium">Patient ID</label>
              <input
                type="text"
                name="Patient_ID"
                value={formData.Patient_ID}
                onChange={handleChange}
                placeholder="Enter Patient ID"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Urban/Rural</label>
              <select
                name="Urban_Rural"
                value={formData.Urban_Rural}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Gender</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Age</label>
              <input
                type="number"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                placeholder="Enter Age"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Blood Group</label>
              <select
                name="Blood_Group"
                value={formData.Blood_Group}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Triage Level</label>
              <select
                name="Triage_Level"
                value={formData.Triage_Level}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              >
                <option value="">Select</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Factor</label>
              <input
                type="text"
                name="Factor"
                value={formData.Factor}
                onChange={handleChange}
                placeholder="Enter Factor"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Entry Date</label>
              <input
                type="date"
                name="Entry_Date"
                value={formData.Entry_Date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium">Entry Time</label>
              <input
                type="time"
                name="Entry_Time"
                value={formData.Entry_Time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                required
              />
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 text-white font-semibold rounded-md bg-blue-600 hover:bg-blue-700 transition"
              disabled={!hospitalId}
            >
              {hospitalId ? "Submit Entry" : "Hospital ID not found"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;