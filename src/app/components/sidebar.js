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
                className="fixed lg:relative top-0 left-0 h-full lg:h-auto bg-[#5d86b5] bg-opacity-85 rounded-lg shadow-2xl backdrop-blur-sm text-white p-4 flex flex-col justify-between m-3 w-[clamp(12%,18vw,20%)]"
            >
                <div className="flex flex-col gap-5 justify-center">
                    <h1 className="text-center rounded-2xl rounded-b-none p-4 py-8 text-[clamp(0.8rem,2vw,1.7rem)] font-extrabold tracking-wide drop-shadow-lg bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f] mb-16">
                        smart_ER
                    </h1>

                    {[
                        { href: "/dashboard", icon: MdSpaceDashboard, label: "Dashboard" },
                        { href: "/input", icon: BiEdit, label: "Patient Entry" },
                        { href: "/predictions", icon: MdOutlineAutoGraph, label: "Predictions" },
                        { href: "/notifications", icon: IoMdNotifications, label: "Notifications" },
                    ].map(({ href, icon: Icon, label }) => (
                        <Link 
                            key={href} 
                            href={href} 
                            className={`flex gap-2 items-center p-3 rounded-2xl rounded-t-none transition shadow-xl text-[clamp(0.9rem, 1vw, 1.2rem)] 
                            ${pathname === href ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'}`}
                        >
                            <Icon className="text-[clamp(1rem, 1.5vw, 1.3rem)] text-gray-300" />
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="relative">
                    <button className="p-3 rounded-lg bg-black shadow-md mt-auto transition">
                        Dark Mode
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
