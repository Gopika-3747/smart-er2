'use client';

import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';



const Navbar = () => {

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated'); 
        localStorage.removeItem('username');
        localStorage.removeItem('hospitalName');
        alert('Logged out successfully!');
        router.push('/');
      };


      
    const router = useRouter(); 
    const [userName, setUserName] = useState('User');
    const [hospitalName, setHospitalName] = useState('Hospital');
    const [dropdownOpen, setDropdownOpen] = useState(false);

     useEffect(() => {
        if (typeof window !== 'undefined') {
          setUserName(localStorage.getItem('userName') || 'User');
          setHospitalName(localStorage.getItem('hospitalName') || 'Hospital');
        }
      }, []);

      useEffect( ()=> {
        const handleClickoutside = (e) => {
            if (!e.target.closest("#profile-menu")) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("click",handleClickoutside)
        return () => {
            document.removeEventListener("click",handleClickoutside)
        };
      }, []);

    return (
        <div className="h-[12vh] flex justify-between items-center px-2 pl-0 bg-[#5d86b5] m-3 bg-opacity-75 rounded-lg shadow-2xl">

<div className="flex justify-between items-center gap-2">

<h1 className="text-white rounded-l-lg p-4 text-[clamp(0.8rem,2vw,1.7rem)] font-extrabold tracking-wider drop-shadow-lg bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f] ">smart_ER</h1>

       <p className="text-white text-[clamp(0.8rem,2vw,1.2rem)] font-sans font-semibold"> Welcome to {hospitalName},{} - Successfully Logged In</p>
      </div>

      {/* Right - Profile Dropdown */}
      <div className="relative ">
        <button id="profile-menu" 
                onClick={(e) =>{
                e.stopPropagation();
                setDropdownOpen((prev) => !prev);}}
          className="flex items-center gap-1 text-[clamp(0.8rem,2vw,1.2rem)] text-white hover:opacity-80 transition"
        > {userName}
          <FaUserCircle size={30} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-blue-50 backdrop-blur-md shadow-lg z-50 ">
            <a href="/profile" className=" block px-4 py-2 text-gray-800 hover:bg-gray-200">
              Profile
            </a>
            <button
              onClick={handleLogout}
              className=" block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      </div>
    );
 } ;

 export default Navbar;