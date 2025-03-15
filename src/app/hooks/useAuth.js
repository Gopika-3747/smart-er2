'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/'); 
      
    } else {
      setIsAuthenticated(true); 
    }
    setIsLoading(false); 
  }, [router]);

  return { isAuthenticated, isLoading };
};

export default useAuth;