'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaBell, FaUserMd, FaChartBar } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname(); 


  const menuItems = [
    { name: 'Dashboard', icon: <FaHome size={20} />, route: '/dashboard' },
    { name: 'Notifications', icon: <FaBell size={20} />, route: '/notifications' },
    { name: 'Patient Entry', icon: <FaUserMd size={20} />, route: '/input' },
    { name: 'Prediction', icon: <FaChartBar size={20} />, route: '/predictions' },
  ];

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${isHovered ? 'w-48' : 'w-[3.8rem]'} 
        bg-[#5d86b5] gap-2 bg-opacity-65 backdrop-blur-md text-gray-200 min-h-[88vh] 
         m-1 p-[3px] shadow-2xl rounded-r-2xl flex flex-col overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       
      
      {/* Menu */}
      <div className="flex flex-col gap-4 mt-20">
      {menuItems.map((item, index) => {
          const isActive = pathname === item.route;

          return (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              
              className={`flex items-center gap-4 
                text-[clamp(0.9rem,2vw,1rem)] font-medium p-3 transition duration-300 whitespace-nowrap shadow-md bg-opacity-65 ${isActive ? 'border-l-[5px] text-[#1f435a] bg-blue-100 border-l-blue-600 font-semibold' : 'text-gray-100 hover:bg-blue-200 hover:text-[#245370]'}`}
            >
             <span className="min-w-[20px] flex justify-center">{item.icon}</span>
             <span className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'translate-x-0' : '-translate-x-4'} transform`}>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;