'use client';

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ProfileModal from "./ProfileModal";
import NotificationBell from '../context/NotificationContext';

const Navbar = () => {
    const router = useRouter(); 
    const [userName, setUserName] = useState('User');
    const [hospitalName, setHospitalName] = useState('Hospital');
    const [userID, setUserId] = useState('User');
    const [role, setRole] = useState('User');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); 

    const handleLogout = () => {

      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        // Perform logout logic

        localStorage.removeItem('isAuthenticated'); 
        localStorage.removeItem('userName');
        localStorage.removeItem('hospitalName');
        localStorage.removeItem('role');
        localStorage.removeItem('userID');
        localStorage.setItem('justLoggedOut', 'true');
        router.push('/');}
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserName(localStorage.getItem('userName') || 'User');
            setHospitalName(localStorage.getItem('hospitalName') || 'Hospital');
            setRole(localStorage.getItem('role') || 'User');
            setUserId(localStorage.getItem('userID') || 'User');
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("#profile-menu")) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const userDetails = {
        userName,
        hospitalName,
        userID, 
        role 
    };

    return (
      <>
        <div className="sticky top-1 rounded-t-2xl bottom-0 left-0 right-0 z-[9999] mx-1 h-[12vh] flex justify-between items-center px-2 pl-0 bg-[#5d86b5] gap-1 shadow-2xl">

<div className="flex justify-between items-center gap-2">

<h1 className="h-[12vh] w-48 text-center content-center text-white p-4 text-[clamp(1.3rem,2vw,1.7rem)] font-extrabold rounded-tl-2xl tracking-wider drop-shadow-lg bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f] ">smart_ER</h1>

       <p className="text-white text-[clamp(0.9rem,2vw,1.2rem)] font-sans font-semibold"> Welcome to {hospitalName}</p>
      </div>

                <div className="relative flex items-center gap-3">
                    <NotificationBell  />
                    <button 
                        id="profile-menu" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen((prev) => !prev);
                        }}
                        className="h-[12vh] font-semibold flex items-center pt-1 gap-2 text-[clamp(0.8rem,2vw,1.1rem)] text-white hover:opacity-80 transition"
                    >
                        {userName}
                        <span className="bg-black rounded-full"><FaUserCircle className="text-white" size={30} /></span>
                    </button>
                    
                    {dropdownOpen && (
                        <div className=" absolute right-0 top-16 rounded-lg w-40 bg-white backdrop-blur-md shadow-lg z-50">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(true);
                                    setDropdownOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                userDetails={userDetails}
            />
        </>
    );
};

export default Navbar;