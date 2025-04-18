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
      className={`transition-all duration-300 ease-in-out ${isHovered ? 'w-56' : 'w-18'} 
        bg-[#5d86b5] gap-2 bg-opacity-65 backdrop-blur-md text-gray-200 min-h-[88vh] 
        p-3 shadow-2xl rounded-tr-xl rounded-br-xl flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Menu - No toggle button needed */}
      <div className="flex flex-col gap-5 mt-8"> {/* Increased top margin */}
        {menuItems.map((item, index) => {
          const isActive = pathname === item.route;

          return (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className={`flex items-center gap-4 text-md font-medium p-3 rounded-xl transition whitespace-nowrap shadow-xl
                ${isActive ? 'bg-blue-600 text-gray-100 font-semibold' : 'hover:bg-blue-200 hover:text-[#245370]'}`}
            >
              {item.icon}
              {isHovered && <span>{item.name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;