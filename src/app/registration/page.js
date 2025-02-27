'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegistrationPage = () => {
  const router = useRouter();
  
  // State to store form inputs, errors, and loading status
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle input changes and update state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on input change
  };

  // Function to handle form submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();

    // Validate form inputs
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First Name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }
    if (!formData.role) newErrors.role = 'Role is required.';
    if (!formData.department) newErrors.department = 'Department is required.';

    // Set errors if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form data to the server
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration request submitted successfully!');
        router.push('/'); // Redirect to login page
      } else {
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: "url('/bg-image.webp')" }}
    >
      <div className="mb-5 mt-20 w-full max-w-md p-8 bg-white/90 rounded-2xl shadow-2xl backdrop-blur-md">
        
        <div className="mt-[-70px] m-auto h-[6rem] w-[6rem] text-center text-[1.9rem] mb-6 rounded-full border-2 border-black shadow-md bg-slate-300">
          <i className="fa-solid fa-user text-black text-[240%] pt-1"></i>
        </div>

        <h2 className="text-2xl font-bold text-blue-700 mb-3 text-center font-mono">
          REGISTRATION REQUEST
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Please fill out the form below to request an account. Only authorized medical staff will be approved.
        </p>
        
        <form onSubmit={handleRegistrationSubmit}>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-md shadow-sm placeholder:italic ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-md shadow-sm placeholder:italic ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-md shadow-sm placeholder:italic ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input
              type="text"
              name="role"
              placeholder="Role (e.g., Doctor, Nurse)"
              value={formData.role}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-md shadow-sm placeholder:italic ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-md shadow-sm placeholder:italic ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full py-3 font-semibold text-white bg-gradient-to-r from-green-400 to-green-600 rounded-md shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Request Registration'}
          </button>
        </form>

        <div className="mt-2 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;