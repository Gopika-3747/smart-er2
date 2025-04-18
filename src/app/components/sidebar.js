'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaBell, FaUserMd, FaChartBar, FaBars } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname(); // <-- ADDED


  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: 'Dashboard', icon: <FaHome size={20} />, route: '/dashboard' },
    { name: 'Notifications', icon: <FaBell size={20} />, route: '/notifications' },
    { name: 'Patient Entry', icon: <FaUserMd size={20} />, route: '/input' },
    { name: 'Prediction', icon: <FaChartBar size={20} />, route: '/predictions' },
  ];

  return (
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'w-56' : 'w-18'} 
      bg-[#5d86b5] gap-2 bg-opacity-65 backdrop-blur-md text-gray-200 min-h-[88vh] 
      p-3 shadow-2xl rounded-tr-xl rounded-br-xl flex flex-col`}>
      
      {/* Toggle Button */}
      <div className="flex justify-end mb-3">
        <button
          onClick={toggleSidebar}
          className=" text-gray-100 bg-blue-00 hover:text-blue-200 transition p-1"
        >
          {isOpen ? <IoClose size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-5 mt-2">
      {menuItems.map((item, index) => {
          const isActive = pathname === item.route;

          return (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className={`flex items-center gap-4 text-md font-medium p-3 rounded-xl rounded-t-none transition whitespace-nowrap shadow-xl ${isOpen ? '' : "rounded-t-xl"}
                ${isActive ? 'bg-blue-600 text-gray-100 font-semibold' : 'hover:bg-blue-200 hover:text-[#245370]'}`}
            >
              {item.icon}
              {isOpen && <span>{item.name}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;