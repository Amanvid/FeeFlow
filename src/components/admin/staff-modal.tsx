"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TeacherUser, NonTeacherUser } from "@/lib/definitions";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  staff?: TeacherUser | NonTeacherUser;
  type: 'teacher' | 'non-teacher';
}

export default function StaffModal({ isOpen, onClose, onSave, staff, type }: StaffModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: '',
    status: 'Active',
    class: '',
    contact: '',
    location: '',
    employmentDate: '',
    dateStopped: '',
    department: '',
    adminPrivileges: 'No'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        username: staff.username,
        password: '', // Don't populate password for security
        role: staff.role,
        status: staff.status,
        class: 'class' in staff ? staff.class : '',
        contact: staff.contact || '',
        location: staff.location || '',
        employmentDate: 'employmentDate' in staff ? staff.employmentDate || '' : '',
        dateStopped: 'dateStopped' in staff ? staff.dateStopped || '' : '',
        department: 'department' in staff ? staff.department : '',
        adminPrivileges: 'adminPrivileges' in staff ? staff.adminPrivileges || 'No' : 'No'
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: '',
        status: 'Active',
        class: '',
        contact: '',
        location: '',
        employmentDate: '',
        dateStopped: '',
        department: '',
        adminPrivileges: 'No'
      });
    }
    setError('');
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.username || (!staff && !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }

    if (type === 'teacher' && !formData.class) {
      setError('Please select a class for teachers');
      return;
    }

    if (type === 'non-teacher' && !formData.department) {
      setError('Please select a department for non-teaching staff');
      return;
    }

    setIsLoading(true);
    
    try {
      const submitData: any = { ...formData };
      if (staff && !formData.password) {
        delete submitData.password; // Don't send empty password on update
      }
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? `Edit ${type === 'teacher' ? 'Teacher' : 'Non-Teaching Staff'}` : `Add ${type === 'teacher' ? 'Teacher' : 'Non-Teaching Staff'}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {!staff && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Enter role"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPrivileges">Admin Privileges</Label>
              <Select value={formData.adminPrivileges} onValueChange={(value) => handleInputChange('adminPrivileges', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'teacher' ? (
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                placeholder="Enter class (e.g., Class 1, Class 2)"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Phone number or email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Location/Address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentDate">Employment Date</Label>
              <Input
                id="employmentDate"
                type="date"
                value={formData.employmentDate}
                onChange={(e) => handleInputChange('employmentDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateStopped">Date Stopped</Label>
              <Input
                id="dateStopped"
                type="date"
                value={formData.dateStopped}
                onChange={(e) => handleInputChange('dateStopped', e.target.value)}
              />
            </div>
          </div>

          {staff && (
            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter new password (optional)"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : staff ? 'Update' : 'Add'} Staff
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}