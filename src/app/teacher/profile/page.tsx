'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, User, Shield, BookOpen, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeacherNav from '@/components/teacher/teacher-nav';

interface TeacherProfile {
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  class: string;
  joinedDate: string;
  subjects: string[];
  status: 'active' | 'inactive';
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/teacher-logout', { method: 'POST' });
      router.push('/teacher/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      const response = await fetch('/api/auth/teacher-session');
      const result = await response.json();
      
      if (result.success) {
        setTeacherName(result.teacher.name);
        // Mock additional profile data - in real app, this would come from a dedicated API
        const enhancedProfile: TeacherProfile = {
          ...result.teacher,
          email: `${result.teacher.username}@school.edu.gh`,
          phone: '+233 24 XXX XXXX',
          joinedDate: new Date().toISOString().split('T')[0],
          subjects: ['Mathematics', 'Science', 'English'],
          status: 'active'
        };
        setProfile(enhancedProfile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data'
        });
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav teacherName={teacherName} onLogout={handleLogout} />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherNav teacherName={teacherName} onLogout={handleLogout} />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">Failed to load profile data</p>
              <Button onClick={fetchTeacherProfile}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherNav teacherName={teacherName} onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Profile</h1>
          <p className="text-gray-600">View and manage your profile information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3b82f6&color=fff`} />
                  <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <p className="text-gray-600">@{profile.username}</p>
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                    {profile.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined: {new Date(profile.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900 capitalize">{profile.role}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Assigned Class</label>
                <p className="text-gray-900">{profile.class || 'Not assigned'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Subjects Taught</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profile.class ? '1' : '0'}</div>
                  <div className="text-sm text-gray-600">Classes Assigned</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profile.subjects.length}</div>
                  <div className="text-sm text-gray-600">Subjects Teaching</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor((Date.now() - new Date(profile.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Since Joined</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  Edit Profile
                </Button>
                <Button variant="outline" className="flex-1">
                  Change Password
                </Button>
                <Link href="/teacher/staff-contacts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Staff Contacts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}