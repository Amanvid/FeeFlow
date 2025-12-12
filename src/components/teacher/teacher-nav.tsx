'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, BookOpen, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeacherNavProps {
  teacherName: string;
  onLogout: () => void;
}

export default function TeacherNav({ teacherName, onLogout }: TeacherNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/teacher/classes', label: 'Classes', icon: BookOpen },
    { href: '/teacher/sba-assessment', label: 'SBA Assessment', icon: BookOpen },
    { href: '/teacher/profile', label: 'My Profile', icon: User },
    { href: '/teacher/staff-contacts', label: 'Staff Contacts', icon: Users },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {teacherName}</p>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden border-t pt-4 pb-2">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}