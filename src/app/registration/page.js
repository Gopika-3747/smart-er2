'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCircleUser } from "react-icons/fa6";

const RegistrationPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    userID: '', 
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    reenterPassword: '',
    hospitalName: '', 
    hospitalID:'',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    supervisorId: '',
    supervisorPassword: '',
    adminId: '',
    adminPassword: '',
  });

  const [credentialError, setCredentialError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); 
  };

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    setCredentialError('');
  };

  const validateCredentials = () => {
    if (formData.role.toLowerCase() === 'admin') {
      if (!credentials.supervisorId || !credentials.supervisorPassword) {
        setCredentialError('Supervisor ID and Password are required for Admin role.');
        return false;
      }
    } else if (formData.role.toLowerCase() === 'doctor' || formData.role.toLowerCase() === 'nurse') {
      if (!credentials.adminId || !credentials.adminPassword) {
        setCredentialError('Admin ID and Password are required for Doctor and Nurse roles.');
        return false;
      }
    }
    return true;
  };
  const verifyCredentials = async (role, credentials) => {
    try {
      const endpoint = role.toLowerCase() === 'admin' 
        ? `${'http://localhost:5000'}}/api/verify-supervisor` 
        : `${'http://localhost:5000'}/api/verify-admin`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: role.toLowerCase() === 'admin' ? credentials.supervisorId : credentials.adminId,
          password: role.toLowerCase() === 'admin' ? credentials.supervisorPassword : credentials.adminPassword,
        }),
      });
  
      const data = await response.json();
      return data.isValid; 
    } catch (err) {
      console.error('Error verifying credentials:', err);
      return false;
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
  
  
    const newErrors = {};
    if (!formData.userID.trim()) newErrors.userID = 'User ID is required.';
    if(formData.userID.length > 5) newErrors.userID='User ID must be less than 5 characters.';
    if (!formData.firstName) newErrors.firstName = 'First Name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }
    if (!formData.role) newErrors.role = 'Role is required.';
    else if (!['admin', 'doctor', 'nurse'].includes(formData.role.toLowerCase())) {
      newErrors.role = 'Invalid role. Allowed roles are Admin, Doctor, and Nurse.';
    }
    if (!formData.hospitalName) newErrors.hospitalName = 'Hospital Name is required.';
    if (!formData.hospitalID) newErrors.hospitalID = 'Hospital ID is required.';
    if (!formData.password.trim()) newErrors.password = 'Password is required.';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password.length > 10) newErrors.password ="Password cannot be longer than 10 characters!"
    if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    if (!/[a-zA-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter';
    }
    if (!formData.reenterPassword.trim()) newErrors.reenterPassword = 'Please re-enter your password.';
    if (formData.password !== formData.reenterPassword) {
      newErrors.reenterPassword = 'Passwords do not match.';
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    
    if (!validateCredentials()) {
      return;
    }
  
    
    setIsLoading(true);
    try {
      const isValid = await verifyCredentials(formData.role, credentials);
      if (!isValid) {
        setCredentialError('Invalid credentials. Please check your Supervisor/Admin ID and Password.');
        return;
      }
  
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: formData.userID,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          hospitalName: formData.hospitalName,
          hospitalID: formData.hospitalID,
          supervisorId: formData.role.toLowerCase() === 'admin' ? credentials.supervisorId : null,
          supervisorPassword: formData.role.toLowerCase() === 'admin' ? credentials.supervisorPassword : null,
          adminId: formData.role.toLowerCase() !== 'admin' ? credentials.adminId : null,
          adminPassword: formData.role.toLowerCase() !== 'admin' ? credentials.adminPassword : null,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Registration request submitted successfully!');
        router.push('/');
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
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-[#5d86b5] bg-opacity-60 backdrop-blur-sm"
    >
      <div className="mb-5 mt-[7vh] w-full max-w-md p-8 bg-[#245370] backdrop-blur-sm bg-opacity-75 rounded-2xl shadow-2xl ">
        
        <div className="mt-[-70px] m-auto h-[6rem] w-[6rem] text-center rounded-full shadow-md bg-slate-300">
          <FaCircleUser className="text-gray-800 text-[6rem]"/>
        </div>

        <h2 className="text-[1.3rem] font-bold text-gray-100 mb-3 text-center font-sans">
          REGISTRATION
        </h2>
        <p className="text-sm text-gray-300 text-center">
          Please fill out the form below to request an account. Only authorized medical staff will be approved.
        </p>
        
        <form onSubmit={handleRegistrationSubmit}>
          <div className="flex flex-col gap-1">
            <input
              type="text"
              name="userID"
              placeholder="User ID"
              value={formData.userID}
              onChange={handleChange}
              className={`register ${errors.userID ? 'border-red-900' : 'border-gray-400'}`}/>
            {errors.userID && <p className="text-red-900 text-sm">{errors.userID}</p>}

            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`register ${errors.firstName ? 'border-red-900' : 'border-gray-300'}`}
            />
            {errors.firstName && <p className="text-red-900 text-sm">{errors.firstName}</p>}

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`register ${errors.lastName ? 'border-red-900' : 'border-gray-300'}`}
            />
            {errors.lastName && <p className="text-red-900 text-sm">{errors.lastName}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`register ${errors.email ? 'border-red-900' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-900 text-sm">{errors.email}</p>}

            <input
              type="text"
              name="role"
              placeholder="Role (e.g., Doctor, Nurse, Admin)"
              value={formData.role}
              onChange={handleChange}
              className={`register ${errors.role ? 'border-red-900' : 'border-gray-300'}`}
            />
            {errors.role && <p className="text-red-900 text-sm">{errors.role}</p>}

            <input
              type="text"
              name="hospitalName"
              placeholder="Hospital Name"
              value={formData.hospitalName}
              onChange={handleChange}
              className={`register ${
                errors.hospitalName ? 'border-red-900' : 'border-gray-300'
              }`}
            />
            {errors.hospitalName && <p className="text-red-900 text-sm">{errors.hospitalName}</p>}
            

            <input
              type="text"
              name="hospitalID"
              placeholder="Hospital ID"
              value={formData.hospitalID}
              onChange={handleChange}
              className={`register ${
                errors.hospitalID ? 'border-red-900' : 'border-gray-300'
              }`}
            />
            {errors.hospitalID && <p className="text-red-900 text-sm">{errors.hospitalID}</p>}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`register ${
                errors.password ? 'border-red-900' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="text-red-900 text-sm">{errors.password}</p>}

            <input
              type="password"
              name="reenterPassword"
              placeholder="Re-enter Password"
              value={formData.reenterPassword}
              onChange={handleChange}
              className={`register ${
                errors.reenterPassword ? 'border-red-900' : 'border-gray-300'
              }`}
            />
            {errors.reenterPassword && <p className="text-red-900 text-sm">{errors.reenterPassword}</p>}
          </div>

          {/* Supervisor Credentials for Admin Role */}
          {formData.role.toLowerCase() === 'admin' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Supervisor Credentials</h3>
              <input
                type="text"
                name="supervisorId"
                placeholder="Supervisor ID"
                value={credentials.supervisorId}
                onChange={handleCredentialChange}
                className=" register placeholder:italic"
              />
              <input
                type="password"
                name="supervisorPassword"
                placeholder="Supervisor Password"
                value={credentials.supervisorPassword}
                onChange={handleCredentialChange}
                className="register placeholder:italic"
              />
              {credentialError && <p className="text-red-500 text-sm">{credentialError}</p>}
            </div>
          )}

          {/* Admin Credentials for Doctor and Nurse Roles */}
          {(formData.role.toLowerCase() === 'doctor' || formData.role.toLowerCase() === 'nurse') && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Admin Credentials</h3>
              <input
                type="text"
                name="adminId"
                placeholder="Admin ID"
                value={credentials.adminId}
                onChange={handleCredentialChange}
                className="register placeholder:italic mb-2"
              />
              <input
                type="password"
                name="adminPassword"
                placeholder="Admin Password"
                value={credentials.adminPassword}
                onChange={handleCredentialChange}
                className="register placeholder:italic"
              />
              {credentialError && <p className="text-red-500 text-sm ">{credentialError}</p>}
            </div>
          )}

          <div className='text-center mt-2'>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-[60%] py-3 font-semibold text-white bg-gradient-to-r from-green-400 to-green-600 rounded-md shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Request Registration'}
          </button>
          </div>
        </form>

        <div className="mt-2 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-100 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
  };

export default RegistrationPage;