'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check authentication for login page
    if (pathname === '/teacher/login') {
      setIsLoading(false);
      return;
    }
    
    checkAuthentication();
  }, [pathname]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/teacher-session');
      const result = await response.json();
      
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        router.push('/teacher/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/teacher/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For login page, always show content
  if (pathname === '/teacher/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // This will prevent flash of content before redirect
  }

  return <>{children}</>;
}