
"use client";

import { useEffect, useState } from "react";
import { getStudentsByClass } from "@/lib/data";
import type { Student } from "@/lib/definitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const RelationshipSchema = z.object({
  relationship: z.string().min(1, "Please select a relationship."),
});

type StudentSelectionProps = {
  className: string;
  onStudentSelected: (student: Student, relationship: string) => void;
  onBack: () => void;
};

export default function StudentSelection({ className, onStudentSelected, onBack }: StudentSelectionProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof RelationshipSchema>>({
    resolver: zodResolver(RelationshipSchema),
    defaultValues: { relationship: "" },
  });

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
      const fetchedStudents = await getStudentsByClass(className);
      setStudents(fetchedStudents);
      setIsLoading(false);
    }
    fetchStudents();
  }, [className]);

  const handleSelectClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleRelationshipSubmit = async (values: z.infer<typeof RelationshipSchema>) => {
    if (selectedStudent) {
      setIsSubmitting(true);
      await onStudentSelected(selectedStudent, values.relationship);
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <section>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold font-headline text-primary">{className}</h2>
          <p className="text-muted-foreground">Select your child from the list below.</p>
        </div>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead className="hidden md:table-cell">Student ID</TableHead>
                <TableHead className="hidden sm:table-cell">Student Type</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{student.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {student.studentType && (
                        <Badge variant={student.studentType.toLowerCase() === 'new' ? 'default' : 'secondary'}>
                          {student.studentType}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleSelectClick(student)}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No students found in this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary"/>
              Your Relationship
            </DialogTitle>
            <DialogDescription>
              Confirm your relationship to <span className="font-semibold">{selectedStudent?.studentName}</span> to proceed.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRelationshipSubmit)} className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to Student</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Check Fee Balance
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
