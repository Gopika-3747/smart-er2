'use client';

import { IoMdKey } from "react-icons/io";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userID: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const newErrors = {};
    if (!formData.userID.trim()) newErrors.userID = 'UserID is required.';
    if (!formData.password.trim()) newErrors.password = 'Password is required.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long.';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('API URL:', apiUrl); 
  
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: formData.userID, password: formData.password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server responded with an error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
  
      const data = await response.json();
      console.log('Login successful:', data);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('hospitalName', data.user.hospitalName)
      router.push('/dashboard');
    } catch (err) {
      console.error('Error during login:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex flex-1 md:flex-[1.75] items-center justify-center p-6 md:p-10 bg-[#5d86b5] backdrop-blur-sm bg-opacity-75">
        <div className="text-center bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f] rounded-2xl py-[120px] px-[100px] backdrop-blur-md">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg text-white rounded-md flex items-center justify-center">Smart_ER</h1>
          <p className="text-md text-gray-200 mt-2 font-light tracking-wide text-right">-Efficient Emergency Room Management</p>
        </div>
      </div>

      <div className="flex flex-1 md:flex-[1.25] items-center justify-center p-6 md:p-10 bg-blue-100 bg-opacity-90 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="mt-5 flex justify-center text-center text-3xl font-mono font-bold text-blue-700">SYSTEM LOGIN</h2>
          <p className="text-center text-sm mt-1 text-[#60ade0] mb-2"><i>*For Authorized Medical Staff Only</i></p>

          <form onSubmit={handleLoginSubmit}>
            <div className={`mt-10 focus:border-b-blue-700 rounded-md hover:border-custom-blue bg-[#cbd5dd] border-b-2 justify-evenly flex flex-row flex-nowrap ${
              errors.userID ? 'border-red-500 mb-1' : 'border-[#6f6f71]'
            }`}>
              <FaUserCircle className="text-gray-700 pt-2.5 text-[1.8rem]" />
              <input
                type="text"
                name="userID"
                value={formData.userID}
                onChange={handleChange}
                id="userID"
                className="my-2 w-[90%] bg-transparent placeholder:text-[#819ae4] placeholder:font-thin placeholder:text-[0.95rem] focus:outline-none text-[#323338] font-medium"
                placeholder="Enter UserID"
                aria-label="Enter UserID"
              />
            </div>
            {errors.userID && <p className="text-red-500 text-sm" aria-live="polite">{errors.userID}</p>}

            <div className={`mt-8 focus:border-b-blue-700 rounded-md hover:border-custom-blue bg-[#cbd5dd] border-b-2 justify-evenly flex flex-row flex-nowrap ${
              errors.password ? 'border-red-500 mb-1' : 'border-[#6f6f71]'
            }`}>
              <IoMdKey className="text-gray-700 pt-2.5 text-[2rem]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                id="password"
                className="my-2 w-[80%] bg-transparent placeholder:text-[#819ae4] placeholder:font-thin placeholder:text-[0.95rem] focus:outline-none text-[#323338] font-medium"
                placeholder="Enter Password"
                aria-label="Enter Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-700 hover:text-blue-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm" aria-live="polite">{errors.password}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                className="mt-9 mb-2 w-[40%] py-2 bg-blue-700 text-white rounded-md font-mono text-[1.2rem] shadow-md hover:bg-blue-700 transition"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'LOGIN'
                )}
              </button>
            </div>
          </form>

          <div className="flex justify-center items-center">
            <p className="text-sm text-gray-600">Not registered yet?</p>
            <button
              onClick={() => router.push('/registration')}
              className="text-[1rem] text-blue-600 hover:text-blue-800 transition"
            >
              <span className="hover:underline">Create Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;