"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, User, Calendar, BookOpen, CreditCard } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface NewStudentsTableProps {
  students: any[]
}

export default function NewStudentsTable({ students }: NewStudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const router = useRouter()

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.id && student.id.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  const getStatusBadge = (totalBalance: number) => {
    if (totalBalance <= 0) {
      return <Badge variant="default" className="bg-green-500">Paid</Badge>
    } else if (totalBalance > 0 && totalBalance <= 100000) {
      return <Badge variant="secondary" className="bg-yellow-500">Partial</Badge>
    } else {
      return <Badge variant="destructive">Outstanding</Badge>
    }
  }

  const handlePayment = (student: any) => {
    const params = new URLSearchParams({
      purchaseType: 'fee',
      bundle: `Fee for ${student.studentName}`,
      credits: student.id,
      price: student.balance > 0 ? student.balance.toString() : "0",
      studentName: student.studentName,
      class: student.class || '',
      metadataSheet: 'New-Metadata',
    });
    router.push(`/payment/purchase?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search new students..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredStudents.length} new students
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>School Fees</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Total Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.id}</TableCell>
                <TableCell>{student.studentName}</TableCell>
                <TableCell>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">{student.class}</Badge>
                </TableCell>
                <TableCell>{student.gender || 'N/A'}</TableCell>
                <TableCell>{student.fees ? `GH₵ ${student.fees.toLocaleString()}` : 'N/A'}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                    GH₵ {student.amountPaid?.toLocaleString() || "0"}
                  </span>
                </TableCell>
                <TableCell>{student.balance ? `GH₵ ${student.balance.toLocaleString()}` : 'GH₵ 0'}</TableCell>
                <TableCell>{getStatusBadge(student.balance || 0)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePayment(student)}
                    disabled={student.balance <= 0}
                    className="flex items-center gap-1"
                  >
                    <CreditCard className="h-3 w-3" />
                    Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No new students found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
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
  )
}