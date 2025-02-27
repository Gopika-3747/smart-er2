'use client';

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
  
    // Validate form inputs
    const newErrors = {};
    if (!formData.userID) newErrors.userID = 'UserID is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      // Send login request to the backend
      const response = await fetch('http://192.168.77.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Login successful:', data);
        alert('login succefull');
        router.push('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        alert(data.message); // Show error message to the user
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('An error occurred. Please try again.');
    }
  };
  
  // For registration
  const handleRegistration = async () => {
    try {
      const response = await fetch('http://192.168.77.1:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Registration successful:', data);
        router.push('/dashboard');
      } else {
        console.error('Registration failed:', data.message);
        alert(data.message); // Show error message to the user
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('An error occurred. Please try again.');
    }

    
    console.log('Login form submitted', formData);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[url('/bg-image.webp')] bg-cover bg-center">
      
      
      <div className="flex flex-1 md:flex-[1.75] items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-gray-100 font-mono h-[20vh] w-[30vw] bg-[#706666] bg-opacity-50 rounded-md flex items-center justify-center">Smart-ER</h1>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex flex-1 md:flex-[1.25] items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-lg">
          <h2 className="mt-5 flex justify-center text-center text-3xl font-mono font-bold text-blue-700 ">
            SYSTEM LOGIN
          </h2>
          <p className="text-center text-sm mt-1 text-[#60ade0] mb-2">
            <i>*For Authorized Medical Staff Only</i>
          </p>

          <form onSubmit={handleLoginSubmit}>
            
            <div className="flex flex-row flex-nowrap">
             <input
                type="text"
                name="userID"
                value={formData.userID}
                onChange={handleChange}
                id="username"
                className={`my-4 w-full px-2 py-2 border-b-2 placeholder-[#819ae4] placeholder:font-thin placeholder:text-[0.95rem] hover:border-[#76bbce] hover:bg-[#cbd5dd] focus:outline-none focus:border-b-blue-700 hover:rounded-md text-[#393b40] font-semibold ${
                  errors.userID ? 'border-red-500' : 'border-[#6f6f71]'
                }`}
                placeholder="Enter UserID"
              />
            </div>
            {errors.userID && <p className="text-red-500 text-sm">{errors.userID}</p>}

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                id="password"
                className={`mt-3 w-full px-2 py-2 border-b-2 placeholder-[#819ae4] hover:border-[#76bbce] hover:rounded-md hover:bg-[#cbd5dd] focus:outline-none focus:border-b-blue-700 text-[#393b40] font-semibold placeholder:font-thin placeholder:text-[0.95rem] ${
                  errors.password ? 'border-red-500' : 'border-[#6f6f71]'
                }`}
                placeholder="Enter Password"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <button
              type="submit"
              className="m-7 w-[80%] py-2 bg-blue-600 text-white rounded-full font-mono text-[1.2rem] shadow-md hover:bg-blue-700 transition"
            >
              LOGIN
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">Not registered yet?</p>
          </div>

          <div className="w-full h-[5vh] text-center">
            <button
              onClick={handleRegistration}
              className="my-3 text-[1rem] text-blue-600 hover:text-blue-800 transition"
              >
              <span className="py-3 px-5 bg-blue-100 rounded-md hover:bg-blue-200 font-semibold">
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