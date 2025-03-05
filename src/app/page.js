'use client';

import { IoMdKey } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();

  // State to store form inputs and errors
  const [formData, setFormData] = useState({
    userID: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  // Function to handle input changes and update state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on input change
  };

  // Function to handle form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    // Validate form inputs
    const newErrors = {};
    if (!formData.userID) newErrors.userID = 'UserID is required.';
    if (!formData.password) newErrors.password = 'Password is required.';

    // Set errors if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    
    console.log('Login form submitted', formData);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      
      
      <div className="flex flex-1 md:flex-[1.75] items-center justify-center p-6 md:p-10 bg-[#5d86b5] backdrop-blur-sm bg-opacity-75">
        <div className="text-center bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f]
 rounded-2xl py-[120px] px-[100px] backdrop-blur-md">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg text-white rounded-md flex items-center justify-center ">Smart_ER</h1>
          <p className="text-md text-gray-200 mt-2 font-light tracking-wide text-right">-Efficient Emergency Room Management
    </p>
        </div>
      </div>

      {/* Login Form Section */}
     
      <div className="flex flex-1 md:flex-[1.25] items-center justify-center p-6 md:p-10 bg-blue-100 bg-opacity-90 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl ">
          <h2 className="mt-5 flex justify-center text-center text-3xl font-mono font-bold text-blue-700 ">
            SYSTEM LOGIN
          </h2>
          <p className="text-center text-sm mt-1 text-[#60ade0] mb-2">
            <i>*For Authorized Medical Staff Only</i>
          </p>

          <form onSubmit={handleLoginSubmit}>
            
            <div className={`mt-10 focus:border-b-blue-700 rounded-md hover:border-[#76bbce] bg-[#cbd5dd] border-b-2 justify-evenly flex flex-row flex-nowrap ${
                  errors.userID ? 'border-red-500 mb-1' : 'border-[#6f6f71]'
                }`}>
            <FaUserCircle className="text-gray-700 pt-2.5 text-[1.8rem]" />
             <input
                type="text"
                name="userID"
                value={formData.userID}
                onChange={handleChange}
                id="username"
                className="my-2 w-[90%] bg-transparent placeholder:text-[#819ae4] placeholder:font-thin placeholder:text-[0.95rem] focus:outline-none text-[#323338] font-medium "
                placeholder="Enter UserID"
              /> 
            </div>
            {errors.userID && <p className="text-red-500 text-sm">{errors.userID}</p>}

            <div className={`mt-8  focus:border-b-blue-700 rounded-md hover:border-[#76bbce] bg-[#cbd5dd] border-b-2 justify-evenly flex flex-row flex-nowrap ${
                  errors.userID ? 'border-red-500 mb-1' : 'border-[#6f6f71]'
                }`}>
            <IoMdKey className="text-gray-700 pt-2.5 text-[2rem]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                id="password"
                className="my-2 w-[90%] bg-transparent placeholder:text-[#819ae4] placeholder:font-thin placeholder:text-[0.95rem] focus:outline-none text-[#323338] font-medium "
                placeholder="Enter Password"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <div className="flex justify-center ">
            <button
              type="submit"
              className=" mt-9 mb-2 w-[40%] py-2 bg-blue-700 text-white rounded-md font-mono text-[1.2rem] shadow-md hover:bg-blue-700 transition"
            >
              LOGIN
            </button></div>
          </form>

          <div className="flex justify-center items-center">
            <p className="text-sm text-gray-600">Not registered yet?</p>
            <button
              onClick={() => router.push('/registration')}
              className=" text-[1rem] text-blue-600 hover:text-blue-800 transition"
            >
              <span className="hover:underline ">
                Create Account
              </span>
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Login;
