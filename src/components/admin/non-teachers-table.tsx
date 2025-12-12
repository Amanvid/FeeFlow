"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { User, Phone, MapPin, Search, Plus, Edit, Trash2 } from "lucide-react";
import type { NonTeacherUser } from "@/lib/definitions";

export default function NonTeachersTable({ nonTeachers }: { nonTeachers: NonTeacherUser[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedNonTeacher, setSelectedNonTeacher] = useState<NonTeacherUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<NonTeacherUser | null>(null);

  const handleViewDetails = (nonTeacher: NonTeacherUser) => {
    setSelectedNonTeacher(nonTeacher);
    setIsDetailDialogOpen(true);
  };

  const handleAddNonTeacher = () => {
    setSelectedNonTeacher(null);
    setIsModalOpen(true);
  };

  const handleEditNonTeacher = (nonTeacher: NonTeacherUser) => {
    setSelectedNonTeacher(nonTeacher);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (nonTeacher: NonTeacherUser) => {
    setStaffToDelete(nonTeacher);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNonTeacher = async (data: any) => {
    try {
      const url = '/api/admin/non-teachers';
      const method = selectedNonTeacher ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Include username for updates to find the correct row
          username: selectedNonTeacher ? selectedNonTeacher.username : data.username,
          rowIndex: selectedNonTeacher ? nonTeachers.findIndex(t => t.username === selectedNonTeacher.username) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save non-teaching staff');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving non-teaching staff:', error);
      throw error;
    }
  };

  const handleDeleteNonTeacher = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch('/api/admin/non-teachers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowIndex: nonTeachers.findIndex(t => t.username === staffToDelete.username),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete non-teaching staff');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting non-teaching staff:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const filteredNonTeachers = nonTeachers.filter((nonTeacher) =>
    nonTeacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nonTeacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nonTeacher.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nonTeacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Non-Teaching Staff</CardTitle>
              <CardDescription>Manage non-teaching staff members</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search non-teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleAddNonTeacher}>
                <Plus className="h-4 w-4 mr-2" />
                Add Non-Teaching Staff
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNonTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {searchTerm ? "No non-teachers found matching your search" : "No non-teachers available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNonTeachers.map((nonTeacher) => (
                    <TableRow key={nonTeacher.username}>
                      <TableCell className="font-medium">{nonTeacher.name}</TableCell>
                      <TableCell>{nonTeacher.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{nonTeacher.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={nonTeacher.status === 'active' ? 'default' : 'destructive'}
                          className={nonTeacher.status === 'active' ? 'bg-green-600' : ''}
                        >
                          {nonTeacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{nonTeacher.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(nonTeacher)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditNonTeacher(nonTeacher)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(nonTeacher)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Non-Teaching Staff Details</DialogTitle>
            </div>
          </DialogHeader>
          {selectedNonTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{selectedNonTeacher.name}</div>
                  <div className="text-sm text-muted-foreground">@{selectedNonTeacher.username}</div>
                </div>
              </div>
              
              <div className="grid gap-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Department:</span>
                    <Badge variant="outline" className="font-medium">{selectedNonTeacher.department}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="secondary" className="font-medium">{selectedNonTeacher.role}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge 
                      variant={selectedNonTeacher.status === 'active' ? 'default' : 'destructive'}
                      className={selectedNonTeacher.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {selectedNonTeacher.status}
                    </Badge>
                  </div>
                </div>

                {selectedNonTeacher.contact && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Contact:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{selectedNonTeacher.contact}</p>
                  </div>
                )}

                {selectedNonTeacher.location && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{selectedNonTeacher.location}</p>
                  </div>
                )}

                {(selectedNonTeacher.dateCreated || selectedNonTeacher.dateUpdated) && (
                  <div className="rounded-lg border p-3 space-y-1">
                    {selectedNonTeacher.dateCreated && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date Created:</span>
                        <span>{new Date(selectedNonTeacher.dateCreated).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedNonTeacher.dateUpdated && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(selectedNonTeacher.dateUpdated).toLocaleDateString()}</span>
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
        onSave={handleSaveNonTeacher}
        staff={selectedNonTeacher || undefined}
        type="non-teacher"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Non-Teaching Staff</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNonTeacher} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}