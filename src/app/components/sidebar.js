'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';


 
 const Sidebar = () => {

    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated'); 
        localStorage.removeItem('hospitalName');
        alert('Logged out successfully!');
        router.push('/');
      };

    return (
        <div className="w-[20%] h-[100vh] bg-[#245370]  bg-opacity-75 rounded-2xl shadow-2xl backdrop-blur-sm text-white p-4 flex flex-col justify-between mr-2">
        <div className="text-center mt-3 flex items-center justify-center">
          <h1 className="text-[1.2rem] md:text-[2rem] font-extrabold tracking-wide drop-shadow-lg text-white ">smart_ER</h1>
        </div>

        <div className=' flex flex-col gap-5'>
        <Link href="/dashboard" className={`p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/dashboard' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          Dashboard
        </Link>
        <Link href="input" className={`p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/input' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          Input
        </Link>
        <Link href="predictions" className={`p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/predictions' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          Predictions
        </Link>
        <Link href="notifications" className={`p-3 rounded-2xl rounded-t-none transition shadow-xl ${
          pathname === '/notifications' ? 'bg-blue-700 text-gray-200' : 'hover:bg-blue-500'
        }`} >
          Notifications
        </Link>
        </div>

        <div className='text-end'>
        <button onClick={handleLogout} className="p-3 rounded bg-red-600 shadow-md mt-auto hover:bg-red-500 transition">Logout
        </button>
        </div>
  </div>
    )
 } 

 export default Sidebar;