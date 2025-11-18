"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Book, User, DollarSign, AlertCircle, CheckCircle, Clock, Search, Filter, X, CreditCard } from "lucide-react";

interface StudentBooksTableProps {
  students: Array<{
    id: string;
    studentName: string;
    class: string;
    books: number; // Books fee amount
    booksFeePaid: number; // Amount paid for books
    balance: number; // Total balance (includes books + other fees)
    guardianName?: string;
    guardianPhone?: string;
    studentType?: string;
  }>;
  booksPriceByClass?: Record<string, number>; // Optional: books price per class
}

export default function StudentBooksTable({ students, booksPriceByClass = {} }: StudentBooksTableProps) {
  const router = useRouter();
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudentType, setSelectedStudentType] = useState("all");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate books-specific balance and payment status
  const getBooksBalance = (student: any) => {
    const booksFee = student.books || booksPriceByClass[student.class] || 0;
    const paid = student.booksFeePaid || 0;
    
    // New students have their books included in admission fee, so no separate book balance
    // But we still calculate the fee amount for accounting purposes
    if (student.studentType === 'New') {
      return 0; // No outstanding balance since books are included in admission fee
    }
    
    return Math.max(0, booksFee - paid);
  };

  const getPaymentStatus = (student: any) => {
    const booksFee = student.books || booksPriceByClass[student.class] || 0;
    const paid = student.booksFeePaid || 0;
    const balance = getBooksBalance(student);
    
    // New students have their books included in admission fee, so they're automatically Paid
    if (student.studentType === 'New') {
      return { status: 'Paid', color: 'green', icon: CheckCircle };
    } else if (booksFee === 0 && paid === 0) {
      // Only categorize as "No Books" if both books fee and payment are zero
      // This indicates they genuinely don't require books, not just zero balance
      return { status: 'No Books', color: 'gray', icon: Book };
    } else if (balance <= 0) {
      return { status: 'Paid', color: 'green', icon: CheckCircle };
    } else if (paid > 0) {
      return { status: 'Partial', color: 'yellow', icon: Clock };
    } else {
      return { status: 'Owing', color: 'red', icon: AlertCircle };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Part Payment</Badge>;
      case 'Owing':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Owing</Badge>;
      case 'No Books':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No Books</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStudentTypeColor = (studentType?: string) => {
    switch (studentType?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'continuing':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'regular':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getClassColor = (className: string) => {
    const classColors: Record<string, string> = {
      'Creche': 'bg-pink-100 text-pink-800 hover:bg-pink-100',
      'Nursery 1': 'bg-red-100 text-red-800 hover:bg-red-100',
      'Nursery 2': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      'KG 1': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      'KG 2': 'bg-lime-100 text-lime-800 hover:bg-lime-100',
      'BS 1': 'bg-green-100 text-green-800 hover:bg-green-100',
      'BS 2': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
      'BS 3': 'bg-teal-100 text-teal-800 hover:bg-teal-100',
      'BS 4': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
      'BS 5': 'bg-sky-100 text-sky-800 hover:bg-sky-100',
      'BS 6': 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    };
    return classColors[className] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  // Calculate summary statistics
  const totalStudents = students.length;
  const totalBooksFees = students.reduce((sum, student) => {
    const booksFee = student.books || booksPriceByClass[student.class] || 0;
    return sum + booksFee;
  }, 0);
  
  // For new students, calculate their book fees based on class price and add to collected amount
  const newStudentsBookFees = students
    .filter(student => student.studentType === 'New')
    .reduce((sum, student) => sum + (student.books || booksPriceByClass[student.class] || 0), 0);
  
  const totalPaid = students.reduce((sum, student) => sum + (student.booksFeePaid || 0), 0) + newStudentsBookFees;
  const totalBalance = students.reduce((sum, student) => sum + getBooksBalance(student), 0);

  const paidStudents = students.filter(s => getPaymentStatus(s).status === 'Paid').length;
  const partialStudents = students.filter(s => getPaymentStatus(s).status === 'Partial').length;
  const owingStudents = students.filter(s => getPaymentStatus(s).status === 'Owing').length;

  // Get unique values for filters
  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();
  const uniqueStudentTypes = Array.from(new Set(students.map(s => s.studentType)))
    .filter((t): t is string => !!t)
    .sort();

  // Filter students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = searchTerm === "" || 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.guardianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.guardianPhone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesStatus = selectedStatus === "all" || getPaymentStatus(student).status === selectedStatus;
      const matchesStudentType = selectedStudentType === "all" || student.studentType === selectedStudentType;
      
      return matchesSearch && matchesClass && matchesStatus && matchesStudentType;
    });
  }, [students, searchTerm, selectedClass, selectedStatus, selectedStudentType]);

  // Pagination logic
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedStatus, selectedStudentType]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setSelectedStatus("all");
    setSelectedStudentType("all");
  };

  // Handle payment for books
  const handlePayment = (student: any) => {
    const booksFee = student.books || booksPriceByClass[student.class] || 0;
    const paid = student.booksFeePaid || 0;
    const balance = getBooksBalance(student);
    
    // Only proceed if there's a balance to pay
    if (balance > 0) {
      const queryParams = new URLSearchParams({
        purchaseType: 'books',
        bundle: `Books for ${student.studentName}`,
        credits: student.id,
        price: balance.toString(),
        studentName: student.studentName,
        class: student.class
      });
      
      router.push(`/payment/purchase?${queryParams.toString()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Student Books Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, guardian, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(className => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial Payment</SelectItem>
                  <SelectItem value="Owing">Owing</SelectItem>
                  <SelectItem value="No Books">No Books Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Type</label>
              <Select value={selectedStudentType} onValueChange={setSelectedStudentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueStudentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Results and Clear Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
              {(searchTerm || selectedClass || selectedStatus || selectedStudentType) && (
                <span className="ml-2">
                  (filtered)
                </span>
              )}
            </div>
            {(searchTerm || selectedClass !== "all" || selectedStatus !== "all" || selectedStudentType !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Books Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Books Fee (GH₵)</TableHead>
                  <TableHead>Amount Paid (GH₵)</TableHead>
                  <TableHead>Balance (GH₵)</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => {
                  const booksFee = student.books || booksPriceByClass[student.class] || 0;
                  const paid = student.booksFeePaid || 0;
                  const balance = getBooksBalance(student);
                  const paymentStatus = getPaymentStatus(student);
                  const StatusIcon = paymentStatus.icon;

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {student.studentName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getStudentTypeColor(student.studentType)}`}>
                          {student.studentType?.toLowerCase() || 'regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getClassColor(student.class)}>
                          {student.class}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        GH₵{booksFee.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600">
                        GH₵{paid.toLocaleString()}
                      </TableCell>
                      <TableCell className={balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        GH₵{balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 text-${paymentStatus.color}-500`} />
                          {getStatusBadge(paymentStatus.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePayment(student)}
                          disabled={balance <= 0 || student.studentType === 'New'}
                          className="flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
        </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students match your current filters.</p>
              {(searchTerm || selectedClass || selectedStatus || selectedStudentType) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 mx-auto"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}