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
      router.push('/'); // Redirect to login page if not authenticated
    } else {
      setIsAuthenticated(true); // Allow rendering if authenticated
    }
    setIsLoading(false); // Mark loading as complete
  }, [router]);

  return { isAuthenticated, isLoading };
};

export default useAuth;