"use client";
import Sidebar from '../components/sidebar';
import { useState } from "react";
import { useForm } from "react-hook-form";

const PatientEntry = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data) => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Patient Entry Submitted Successfully");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Patient Entry Form Container */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Patient Entry Form
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient Name */}
            <div>
              <label className="block text-gray-700 font-medium">Patient Name</label>
              <input
                {...register("name", { required: "Patient name is required" })}
                type="text"
                placeholder="Enter full name"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">Age</label>
                <input
                  {...register("age", { required: "Age is required", valueAsNumber: true })}
                  type="number"
                  placeholder="Enter age"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Gender</label>
                <select
                  {...register("gender", { required: "Please select a gender" })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
              </div>
            </div>

            {/* Blood Group & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">Blood Group</label>
                <select
                  {...register("blood_group", { required: "Please select blood group" })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.blood_group && <p className="text-red-500 text-sm">{errors.blood_group.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Condition</label>
                <textarea
                  {...register("condition", { required: "Condition details are required" })}
                  placeholder="Describe patient condition..."
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                />
                {errors.condition && <p className="text-red-500 text-sm">{errors.condition.message}</p>}
              </div>
            </div>

            {/* Entry Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">Entry Date</label>
                <input
                  type="date"
                  {...register("entry_date", { required: "Entry date is required" })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                />
                {errors.entry_date && <p className="text-red-500 text-sm">{errors.entry_date.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Entry Time</label>
                <input
                  type="time"
                  {...register("entry_time", { required: "Entry time is required" })}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                />
                {errors.entry_time && <p className="text-red-500 text-sm">{errors.entry_time.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 text-white font-semibold rounded-md transition ${
                isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Entry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientEntry;
