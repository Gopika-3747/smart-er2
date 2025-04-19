'use client';

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ProfileModal from "./ProfileModal";

const Navbar = () => {
    const router = useRouter(); 
    const [userName, setUserName] = useState('User');
    const [hospitalName, setHospitalName] = useState('Hospital');
    const [userID, setUserId] = useState('User');
    const [role, setRole] = useState('User');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); 

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated'); 
        localStorage.removeItem('userName');
        localStorage.removeItem('hospitalName');
        localStorage.removeItem('role');
        localStorage.removeItem('userID');
        localStorage.setItem('justLoggedOut', 'true');
        router.push('/');
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
            <div className="fixed top-0 bottom-0 left-0 right-0 h-[12vh] flex justify-between items-center px-2 pl-0 bg-[#5d86b5] m-1 mt-2 gap-1 bg-opacity-75 rounded-t-2xl shadow-2xl">
                <div className="flex justify-between items-center gap-2">
                    <h1 className="h-[12vh] w-48 text-center content-center text-white rounded-tl-2xl p-4 text-[clamp(1.3rem,2vw,1.7rem)] font-extrabold tracking-wider drop-shadow-lg bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f]">smart_ER</h1>
                    <p className="text-white text-[clamp(0.8rem,2vw,1.1rem)] font-sans font-semibold">Welcome to {hospitalName} - Successfully Logged In!</p>
                </div>

                <div className="relative">
                    <button 
                        id="profile-menu" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen((prev) => !prev);
                        }}
                        className="h-[12vh] font-semibold flex items-center pt-1 gap-1 text-[clamp(0.8rem,2vw,1.1rem)] text-white hover:opacity-80 transition"
                    >
                        {userName}
                        <FaUserCircle size={30} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-gray-100 backdrop-blur-md shadow-lg z-50">
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