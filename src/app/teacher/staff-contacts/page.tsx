'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Search, User, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeacherNav from '@/components/teacher/teacher-nav';

interface StaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'teacher' | 'admin' | 'accountant' | 'manager';
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export default function StaffContactsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teacherName, setTeacherName] = useState('');
  const [staffCounts, setStaffCounts] = useState({ teachers: 0, nonTeachingStaff: 0, total: 0 });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStaffData();
    fetchTeacherInfo();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      const response = await fetch('/api/auth/teacher-session');
      const result = await response.json();
      
      if (result.success) {
        setTeacherName(result.teacher.name);
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/teacher-logout', { method: 'POST' });
      router.push('/teacher/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter]);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/teacher/staff-contacts');
      const result = await response.json();
      
      if (result.success) {
        setStaff(result.staff);
        setStaffCounts(result.counts);
      } else {
        console.error('Failed to fetch staff data:', result.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load staff contacts'
        });
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff contacts'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role.toLowerCase() === roleFilter.toLowerCase());
    }

    setFilteredStaff(filtered);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'admin': 
      case 'administrator':
        return 'bg-green-100 text-green-800';
      case 'accountant': return 'bg-purple-100 text-purple-800';
      case 'manager': 
      case 'management':
        return 'bg-orange-100 text-orange-800';
      case 'principal': return 'bg-red-100 text-red-800';
      case 'vice principal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactAction = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${value}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav teacherName={teacherName} onLogout={handleLogout} />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading staff contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav teacherName={teacherName} onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Staff Contacts</h1>
          <p className="text-gray-600">Contact information for all school staff members</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Total: {staffCounts.total}</span>
            <span>•</span>
            <span>Teachers: {staffCounts.teachers}</span>
            <span>•</span>
            <span>Non-teaching: {staffCounts.nonTeachingStaff}</span>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, username, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Administrators</option>
                  <option value="accountant">Accountants</option>
                  <option value="manager">Managers</option>
                  <option value="principal">Principal</option>
                  <option value="vice principal">Vice Principal</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                    <p className="text-sm text-gray-600 truncate">@{member.username}</p>
                  </div>
                  <Badge 
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className="text-sm text-gray-600">{member.department}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleContactAction('email', member.email)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleContactAction('phone', member.phone)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}