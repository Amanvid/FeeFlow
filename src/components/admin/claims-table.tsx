
"use client";

import { useState, useMemo, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { PhoneClaim, Student, SchoolConfig } from "@/lib/definitions";
import { Search, Trash, Loader2, Eye, Printer, FilePlus2 } from "lucide-react";
import { deleteClaim, deleteMultipleClaims, getAllStudents, getSchoolConfig } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import InvoiceCard from "./invoice-card";

const ITEMS_PER_PAGE = 10;

export default function ClaimsTable({ claims: initialClaims }: { claims: PhoneClaim[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [claimToDelete, setClaimToDelete] = useState<PhoneClaim | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [multiDeleteConfirm, setMultiDeleteConfirm] = useState(false);
  const [viewingClaim, setViewingClaim] = useState<PhoneClaim | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadExtraData() {
      setLoadingData(true);
      const [fetchedStudents, fetchedConfig] = await Promise.all([
        getAllStudents(),
        getSchoolConfig()
      ]);
      setStudents(fetchedStudents);
      setSchoolConfig(fetchedConfig);
      setLoadingData(false);
    }
    loadExtraData();
  }, []);

  const filteredClaims = useMemo(() => {
    if (!searchQuery) return claims;
    return claims.filter(
      (claim) =>
        claim.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.class?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [claims, searchQuery]);

  const currentTablePageClaims = useMemo(() => {
    return filteredClaims.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredClaims, currentPage]);
  
  const totalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleDeleteClick = (claim: PhoneClaim) => setClaimToDelete(claim);

  const handleDeleteConfirm = async () => {
    if (!claimToDelete) return;
    setIsDeleting(true);
    const result = await deleteClaim(claimToDelete.invoiceNumber);
    setIsDeleting(false);

    if (result.success) {
      toast({ title: "Claim Deleted", description: `The claim for ${claimToDelete.studentName} has been deleted.` });
      setClaims((prev) => prev.filter((c) => c.invoiceNumber !== claimToDelete.invoiceNumber));
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
    }
    setClaimToDelete(null);
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedClaims(currentTablePageClaims.map(c => c.invoiceNumber));
    } else {
      setSelectedClaims([]);
    }
  };
  
  const handleMultiDeleteConfirm = async () => {
    if (selectedClaims.length === 0) return;
    setIsDeleting(true);
    const result = await deleteMultipleClaims(selectedClaims);
    setIsDeleting(false);

    if (result.success) {
      toast({ title: "Claims Deleted", description: `${selectedClaims.length} claims have been deleted.` });
      setClaims((prev) => prev.filter((c) => !selectedClaims.includes(c.invoiceNumber)));
      setSelectedClaims([]);
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
    }
    setMultiDeleteConfirm(false);
  };

  const isAllOnPageSelected = currentTablePageClaims.length > 0 && currentTablePageClaims.every(c => selectedClaims.includes(c.invoiceNumber));
  
  const selectedStudentForView = students.find(s => s.studentName === viewingClaim?.studentName && s.class === viewingClaim?.class);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                  <CardTitle>Recent Invoice Claims</CardTitle>
                  <CardDescription>A list of the most recent fee checks made by users.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedClaims.length > 0 && (
                   <Button variant="destructive" size="sm" onClick={() => setMultiDeleteConfirm(true)} disabled={isDeleting}>
                      <Trash className="mr-2 h-4 w-4" /> Delete ({selectedClaims.length})
                   </Button>
                )}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by student, guardian, class..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllOnPageSelected} 
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all on page"
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Guardian</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTablePageClaims.length > 0 ? (
                currentTablePageClaims.map((claim) => (
                  <TableRow key={claim.invoiceNumber} data-state={selectedClaims.includes(claim.invoiceNumber) && "selected"}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedClaims.includes(claim.invoiceNumber)}
                        onCheckedChange={(checked) => {
                          setSelectedClaims(prev => checked ? [...prev, claim.invoiceNumber] : prev.filter(id => id !== claim.invoiceNumber))
                        }}
                        aria-label={`Select claim ${claim.invoiceNumber}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{claim.studentName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">{claim.class}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{claim.guardianName}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(claim.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">GH&#8373;{claim.totalFeesBalance.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant={claim.totalFeesBalance > 0 ? "destructive" : "secondary"}>
                        {claim.totalFeesBalance > 0 ? "Owing" : "Paid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingClaim(claim)} title="View Invoice">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(claim)} title="Delete Claim">
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No claims found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredClaims.length)}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredClaims.length)}</strong> of <strong>{filteredClaims.length}</strong> claims
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || currentTablePageClaims.length === 0}>Next</Button>
              </div>
          </div>
        </CardFooter>
      </Card>

      {/* Single Delete Dialog */}
      <AlertDialog open={!!claimToDelete} onOpenChange={(open) => !open && setClaimToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action will permanently delete the invoice claim for <span className="font-semibold">{claimToDelete?.studentName}</span>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Yes, delete claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Multi-Delete Dialog */}
      <AlertDialog open={multiDeleteConfirm} onOpenChange={setMultiDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedClaims.length} Claims?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. You are about to permanently delete {selectedClaims.length} selected claims.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMultiDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Yes, delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Invoice Dialog */}
      <Dialog open={!!viewingClaim} onOpenChange={() => setViewingClaim(null)}>
        <DialogContent className="max-w-4xl p-0">
           <DialogHeader>
            <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          </DialogHeader>
          {(loadingData || !schoolConfig || !selectedStudentForView) ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
             <InvoiceCard 
                claim={viewingClaim!} 
                student={selectedStudentForView}
                config={schoolConfig}
             />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
