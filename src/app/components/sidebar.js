'use client';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { MdSpaceDashboard } from 'react-icons/md';
import { MdOutlineAutoGraph } from "react-icons/md";
import { IoMdNotifications } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';


 
 const Sidebar = () => {

    
    const pathname = usePathname();

    return (
        <div className="w-[20%] bg-[#5d86b5]  bg-opacity-75 rounded-lg shadow-2xl backdrop-blur-sm text-white p-4 flex flex-col justify-between m-3">
        <div className="flex flex-col gap-5 justify-center">
          <h1 className=" text-center rounded-lg p-4 text-[1.2rem] md:text-[2rem] font-extrabold tracking-wide drop-shadow-lg text-white bg-gradient-to-br from-[#245370] via-[#2e5c7a] to-[#3b6b8f] mb-16">smart_ER</h1>

          <Link href="/dashboard" className={`flex gap-1 items-center p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/dashboard' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          <MdSpaceDashboard className="text-[1.3rem] text-gray-300" />
          Dashboard
        </Link>
        <Link href="input" className={`flex gap-1 items-center p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/input' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          <BiEdit className="text-[1.3rem] text-gray-300" />
          Patient Entry
        </Link>
        <Link href="predictions" className={`flex gap-1 items-center p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/predictions' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          <MdOutlineAutoGraph className="text-[1.3rem] text-gray-300" />
          Predictions
        </Link>
        <Link href="notifications" className={`flex gap-1 items-center p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/notifications' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          <IoMdNotifications className="text-[1.3rem] text-gray-300" />
          Notifications
        </Link>

        </div>

        <div className='relative'>
        <button className="p-3 rounded bg-black shadow-md mt-auto transition">Dark Mode
        </button>
        </div>
  </div>
    )
 } 

 export default Sidebar;