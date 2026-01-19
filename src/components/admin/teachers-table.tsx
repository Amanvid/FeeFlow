"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StaffModal from "./staff-modal";
import type { TeacherUser } from "@/lib/definitions";
import { Search, Phone, Mail, MapPin, User, Plus, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ITEMS_PER_PAGE = 10;

export default function TeachersTable({ teachers }: { teachers: TeacherUser[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherUser | null>(null);

  // Filter teachers based on search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;

    return teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTeachers.slice(start, end);
  }, [filteredTeachers, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (teacher: TeacherUser) => {
    setSelectedTeacher(teacher);
    setIsDetailDialogOpen(true);
  };

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleEditTeacher = (teacher: TeacherUser) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (teacher: TeacherUser) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveTeacher = async (data: any) => {
    try {
      const url = '/api/admin/teachers';
      const method = selectedTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Include username for updates to find the correct row
          username: selectedTeacher ? selectedTeacher.username : data.username,
          rowIndex: selectedTeacher ? teachers.findIndex(t => t.username === selectedTeacher.username) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save teacher');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving teacher:', error);
      throw error;
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowIndex: teachers.findIndex(t => t.username === teacherToDelete.username),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete teacher');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setTeacherToDelete(null);
    }
  };

  const handleStatusToggle = async (teacher: TeacherUser, checked: boolean) => {
    try {
      const newStatus = checked ? 'Active' : 'Inactive';
      // Set dateStopped to today if inactive, empty string if active
      const dateStopped = checked ? '' : new Date().toISOString().split('T')[0];

      // Calculate Years of Service from Employment Date
      let yearsOfService = '0';
      if (teacher.employmentDate) {
        const empDate = new Date(teacher.employmentDate);
        if (!isNaN(empDate.getTime())) {
          const today = new Date();
          let years = today.getFullYear() - empDate.getFullYear();
          const m = today.getMonth() - empDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < empDate.getDate())) {
            years--;
          }
          yearsOfService = Math.max(0, years).toString();
        }
      }

      const url = '/api/admin/teachers';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...teacher,
          status: newStatus,
          dateStopped: dateStopped,
          yearsOfService: yearsOfService,
          rowIndex: teachers.findIndex(t => t.username === teacher.username),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      // Ideally show a toast error here
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teachers Directory</CardTitle>
              <CardDescription>
                View and manage teacher information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button onClick={handleAddTeacher}>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Years</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Privileges</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTeachers.map((teacher, index) => (
                  <TableRow key={`${teacher.name}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {teacher.dateOfBirth ? (() => {
                          const dob = new Date(teacher.dateOfBirth);
                          if (!isNaN(dob.getTime())) {
                            const today = new Date();
                            let age = today.getFullYear() - dob.getFullYear();
                            const m = today.getMonth() - dob.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                              age--;
                            }
                            return age;
                          }
                          return '-';
                        })() : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.class}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{teacher.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{teacher.qualification || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{teacher.yearsOfService || '0'} years</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={teacher.status.toLowerCase() === 'active'}
                          onCheckedChange={(checked) => handleStatusToggle(teacher, checked)}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                        />
                        <span className={`text-sm ${teacher.status.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {teacher.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={teacher.adminPrivileges === 'Yes' ? 'default' : 'secondary'}
                        className={teacher.adminPrivileges === 'Yes' ? 'bg-blue-600' : ''}
                      >
                        {teacher.adminPrivileges || 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(teacher)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(teacher)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedTeachers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No teachers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} teachers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Teacher Details</DialogTitle>
            </div>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{selectedTeacher.name}</div>
                  <div className="text-sm text-muted-foreground">@{selectedTeacher.username}</div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Class:</span>
                    <Badge variant="outline" className="font-medium">{selectedTeacher.class}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="secondary" className="font-medium">{selectedTeacher.role}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={selectedTeacher.status === 'active' ? 'default' : 'destructive'}
                      className={selectedTeacher.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {selectedTeacher.status}
                    </Badge>
                  </div>
                </div>

                {selectedTeacher.contact && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Contact:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTeacher.contact}</p>
                  </div>
                )}

                {selectedTeacher.location && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTeacher.location}</p>
                  </div>
                )}

                {(selectedTeacher.employmentDate || selectedTeacher.dateStopped) && (
                  <div className="rounded-lg border p-3 space-y-1">
                    {selectedTeacher.employmentDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Employment Date:</span>
                        <span>{new Date(selectedTeacher.employmentDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTeacher.dateStopped && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date Stopped:</span>
                        <span>{new Date(selectedTeacher.dateStopped).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeacher}
        staff={selectedTeacher || undefined}
        type="teacher"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {teacherToDelete?.name}? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeacher} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
