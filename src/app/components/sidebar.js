'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdSpaceDashboard } from 'react-icons/md';
import { MdOutlineAutoGraph } from "react-icons/md";
import { IoMdNotifications } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';
import { useState } from 'react';
import { IoMenu, IoClose } from 'react-icons/io5';

const Sidebar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);


    return (
        <>
           
            {/* Sidebar */}
            <div 
                className={`absolute lg:relative top-0 left-0 lg:h-auto bg-[#5d86b5] bg-opacity-85 rounded-lg shadow-2xl backdrop-blur-sm text-white p-4 flex flex-col justify-between m-3 mt-0 w-[clamp(12%,18vw,20%)] ${isOpen ? 'w-[clamp(20px,14vw,20%)] rounded-lg' : 'w-[clamp(5px,5vw,5rem)] '}` }
            >
                
                <div className="flex flex-col gap-4 justify-center">

                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={` bg-[#5d86b5] text-white p-2 rounded-full shadow-md transition-all hover:scale-110 mb-8 ml-[-4px] w-[3vw]  ${isOpen ? 'justify-start': 'justify-center'}`}
                >
                    <IoMenu size={24} />
                </button>
                
                    {[
                        { href: "/dashboard", icon: MdSpaceDashboard, label: "Dashboard" },
                        { href: "/input", icon: BiEdit, label: "Patient Entry" },
                        { href: "/predictions", icon: MdOutlineAutoGraph, label: "Predictions" },
                        { href: "/notifications", icon: IoMdNotifications, label: "Notifications" },
                    ].map(({ href, icon: Icon, label }) => (
                        <Link 
                            key={href} 
                            href={href} 
                            className={`flex gap-2 items-center p-3 ml-[-6px] rounded-lg transition shadow-xl
                            ${pathname === href ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'} ${isOpen ? 'justify-start' : 'justify-center w-[3.5vw]'}`}
                        >
                            <Icon size={20} className='text-2xl lg:text-3xl text-gray-300'/>
                            <span className={`${!isOpen && 'hidden'} transition-all duration-300`}>{label}</span>
                        </Link>
                    ))}
                </div>

            </div>
        </>
    );
};

export default Sidebar;
