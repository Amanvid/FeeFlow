
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Student } from "@/lib/definitions";
import { Search, CreditCard, Send, Loader2 } from "lucide-react";
import { sendFeeReminderSms } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 15;

export default function StudentsTable({ students }: { students: Student[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingReminder, setLoadingReminder] = useState<string | null>(null);

  const [isReminderDialog, setIsReminderDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(
      (student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const handleMakePayment = (student: Student) => {
    const params = new URLSearchParams({
        purchaseType: 'fee',
        bundle: `Fee for ${student.studentName}`,
        credits: student.id,
        price: student.balance > 0 ? student.balance.toString() : "0",
        studentName: student.studentName,
        class: student.class || '',
    });
    router.push(`/payment/purchase?${params.toString()}`);
  }

  const handleSendReminder = async (student: Student, phone?: string) => {
    const studentWithPhone = { ...student, guardianPhone: phone || student.guardianPhone };
    
    if (studentWithPhone.balance <= 0) {
      toast({ variant: "destructive", title: "Cannot Send", description: "This student has no outstanding balance." });
      return;
    }
    
    if (!studentWithPhone.guardianPhone) {
      setSelectedStudent(student);
      setIsReminderDialog(true);
      return;
    }

    setLoadingReminder(student.id);
    setIsReminderDialog(false);
    
    const result = await sendFeeReminderSms(studentWithPhone);
    if (result.success) {
      toast({
        title: "Reminder Sent",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: result.message,
      });
    }
    setLoadingReminder(null);
  };
  
  const handleDialogSend = () => {
     if (selectedStudent && manualPhoneNumber) {
      handleSendReminder(selectedStudent, manualPhoneNumber);
      setManualPhoneNumber('');
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                  <CardTitle>Student List</CardTitle>
                  <CardDescription>
                      A comprehensive list of all students in the school.
                  </CardDescription>
              </div>
              <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search by name, ID, class..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1); // Reset to first page on search
                      }}
                  />
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead className="hidden md:table-cell">Gender</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <TableRow key={`${student.id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        ID: {student.id}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {student.class}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {student.gender}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      GH&#8373;{student.balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        className="text-xs"
                        variant={
                          student.balance > 0 ? "destructive" : "secondary"
                        }
                      >
                        {student.balance > 0 ? "Owing" : "Paid"}
                      </Badge>
                    </TableCell>
                     <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        disabled={loadingReminder === student.id || student.balance <= 0}
                        onClick={() => handleSendReminder(student)}
                        title="Send SMS reminder"
                      >
                        {loadingReminder === student.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Reminder
                      </Button>
                      <Button 
                          size="sm" 
                          onClick={() => handleMakePayment(student)}
                          disabled={student.balance <= 0}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
              Showing{" "}
              <strong>
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredStudents.length)}
              </strong>{" "}
              to{" "}
              <strong>
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}
              </strong>{" "}
              of <strong>{filteredStudents.length}</strong> students
              </div>
              <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
              >
                  Previous
              </Button>
              <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || paginatedStudents.length === 0}
              >
                  Next
              </Button>
              </div>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={isReminderDialog} onOpenChange={setIsReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Fee Reminder</DialogTitle>
            <DialogDescription>
              No phone number found for {selectedStudent?.studentName}. Please enter a guardian's phone number to send the reminder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={manualPhoneNumber}
                onChange={(e) => setManualPhoneNumber(e.target.value)}
                placeholder="024XXXXXXX"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleDialogSend}
              disabled={loadingReminder === selectedStudent?.id || !manualPhoneNumber.trim()}
            >
              {loadingReminder === selectedStudent?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
