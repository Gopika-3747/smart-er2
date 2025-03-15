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
        <div className="h-[15vh] flex justify-between items-center px-6 bg-[#5d86b5] mr-3 my-3 bg-opacity-75 rounded-lg shadow-2xl">

<div className="text-cyan-50 text-[1.4rem] font-sans font-semibold">
        Welcome to {hospitalName},{} - Successfully Logged In
      </div>

      {/* Right - Profile Dropdown */}
      <div className="relative ">
        <button id="profile-menu" 
                onClick={(e) =>{
                e.stopPropagation();
                setDropdownOpen((prev) => !prev);}}
          className="flex items-center gap-2 text-[1.1rem] space-x-2 text-white hover:opacity-80 transition"
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