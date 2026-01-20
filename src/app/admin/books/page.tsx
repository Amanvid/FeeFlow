import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllStudents, getBooksConfig } from "@/lib/data";
import { NEW_METADATA, OLD_METADATA } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import BooksStatsCard from "@/components/admin/books/books-stats-card";
import BooksPaymentStatusChart from "@/components/admin/books/books-payment-status-chart";
import BooksPurchaseChart from "@/components/admin/books/books-purchase-chart";
import ClassBooksPriceTable from "@/components/admin/books/class-books-price-table";

import StudentBooksTable from "@/components/admin/books/student-books-table";

export default async function BooksDashboard() {
  const [newStudentsMeta, oldStudentsMeta] = await Promise.all([
    getAllStudents(NEW_METADATA),
    getAllStudents(OLD_METADATA)
  ]);
  const students = [...newStudentsMeta, ...oldStudentsMeta];
  const booksConfig = await getBooksConfig();

  // Class order for consistent display
  const classOrder = ["Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "BS 1", "BS 2", "BS 3", "BS 4", "BS 5", "BS 6"];

  // Books price by class - calculate this first so we can use it for new students
  const booksPriceByClass = students.reduce((acc, student) => {
    if (student.class && student.books > 0) {
      acc[student.class] = student.books; // Assuming books fee is consistent per class
    }
    return acc;
  }, {} as Record<string, number>);

  // Books fee calculations
  const totalBooksPaid = students.reduce((acc, student) => acc + student.booksFeePaid, 0);
  const totalBooksBalance = students.reduce((acc, student) => acc + (student.books - student.booksFeePaid), 0);

  // Calculate new students' book fees based on their class books price
  const newStudentsBookFees = students
    .filter(student => student.studentType === 'New')
    .reduce((sum, student) => {
      // For new students, get the book price from their class configuration
      // since books are included in admission fees and their individual books field might be 0
      const classBookPrice = booksPriceByClass[student.class] || 0;
      return sum + classBookPrice;
    }, 0);

  // Calculate total books fees (paid + outstanding + new students' calculated fees)
  const totalBooksFees = totalBooksPaid + totalBooksBalance + newStudentsBookFees;

  // Calculate collection percentage (including new students' calculated fees as collected)
  const totalBooksCollected = totalBooksPaid + newStudentsBookFees;
  const collectionPercentage = totalBooksFees > 0 ? ((totalBooksCollected / totalBooksFees) * 100).toFixed(1) : '0.0';

  // Payment status for books - New students are automatically Paid since books are included in admission fees
  const fullyPaidBooks = students.filter(s =>
    s.studentType === 'New' || (s.books > 0 && s.booksFeePaid >= s.books)
  ).length;
  const partiallyPaidBooks = students.filter(s =>
    s.studentType !== 'New' && s.books > 0 && s.booksFeePaid > 0 && s.booksFeePaid < s.books
  ).length;
  const owingBooks = students.filter(s =>
    s.studentType !== 'New' && s.books > 0 && s.booksFeePaid === 0
  ).length;
  // More accurate logic for "No Books Required" - students who truly have no book requirements
  // This should be based on class configuration or explicit flags, not just zero book fees
  const noBooksRequired = students.filter(s => {
    // Students with books = 0 AND no books fee payment history AND not a new student
    // This indicates they genuinely don't require books, not just zero balance
    return s.books === 0 && s.booksFeePaid === 0 && s.studentType !== 'New';
  }).length;

  // Calculate total students with books requirements
  const totalStudentsWithBooks = students.filter(s => s.books > 0).length;
  const fullyPaidPercentage = totalStudentsWithBooks > 0 ? ((fullyPaidBooks / totalStudentsWithBooks) * 100).toFixed(1) : '0.0';

  // Calculate percentages for partial payments and owing students
  const partialPaymentPercentage = totalStudentsWithBooks > 0 ? ((partiallyPaidBooks / totalStudentsWithBooks) * 100).toFixed(1) : '0.0';
  const owingPercentage = totalStudentsWithBooks > 0 ? ((owingBooks / totalStudentsWithBooks) * 100).toFixed(1) : '0.0';

  // Calculate admission students books total amount and count
  const admissionStudentsCount = students.filter(s => s.studentType === 'New').length;
  const admissionStudentsBooksTotal = newStudentsBookFees;

  // Calculate old students books fees (old students with books payments)
  const oldStudentsBooksFees = students
    .filter(s => s.studentType === 'Old')
    .reduce((acc, student) => acc + student.booksFeePaid, 0);

  // Calculate books purchased by class (students who have paid for books)
  const booksPurchasedByClass = students.reduce((acc, student) => {
    if (student.class && student.booksFeePaid > 0) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate fully paid books by class (including new students)
  const fullyPaidByClass = students.reduce((acc, student) => {
    if (student.class && (student.studentType === 'New' || (student.books > 0 && student.booksFeePaid >= student.books))) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate partially paid books by class
  const partiallyPaidByClass = students.reduce((acc, student) => {
    if (student.class && student.studentType !== 'New' && student.books > 0 && student.booksFeePaid > 0 && student.booksFeePaid < student.books) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate total books purchased (students who have paid for books)
  const totalBooksPurchased = students.filter(s => s.booksFeePaid > 0).length;

  // Calculate students with books by class (students who have books requirements)
  const studentsWithBooksByClass = students.reduce((acc, student) => {
    if (student.class && student.books > 0) {
      acc[student.class] = (acc[student.class] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Books Dashboard</h1>
      </div>

      {/* Main Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <BooksStatsCard
          title="Total Books Fees Expected"
          value={`GH₵${totalBooksFees.toLocaleString()}`}
          description="Across all students (both Old and New)"
          className="bg-purple-600"
        />
        <BooksStatsCard
          title="Total Books Fees Collected"
          value={`GH₵${totalBooksCollected.toLocaleString()}`}
          description={`${collectionPercentage}% collected`}
          className="bg-blue-600"
        />

      </div>

      {/* Books Fees Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BooksStatsCard
          title="Old Student Books Fees"
          value={`GH₵${oldStudentsBooksFees.toLocaleString()}`}
          description="Books fees paid by old students"
          className="bg-teal-600"
        />
        <BooksStatsCard
          title="Admission Students Books"
          value={`GH₵${admissionStudentsBooksTotal.toLocaleString()}`}
          description={`${admissionStudentsCount} new students (books included in admission)`}
          className="bg-indigo-600"
        />
        <BooksStatsCard
          title="Total Books Fees Outstanding"
          value={`GH₵${totalBooksBalance.toLocaleString()}`}
          description={`${fullyPaidBooks} paid, ${partiallyPaidBooks} partial, ${owingBooks} owing`}
          className="bg-red-500"
        />
      </div>

      {/* Payment Status Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BooksStatsCard
          title="Fully Paid (Books)"
          value={fullyPaidBooks}
          description={`${fullyPaidPercentage}% of total`}
          className="bg-green-600"
        />
        <BooksStatsCard
          title="Partial Payments"
          value={partiallyPaidBooks}
          description={`${partialPaymentPercentage}% of total`}
          className="bg-yellow-600"
        />
        <BooksStatsCard
          title="Owing Students"
          value={owingBooks}
          description={`${owingPercentage}% of total`}
          className="bg-orange-600"
        />
        <BooksStatsCard
          title="No Books Required"
          value={noBooksRequired}
          description="Students without book requirements"
          className="bg-gray-600"
        />
      </div>

      {/* Payment Status Overview */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Books Payment Status</CardTitle>
            <CardDescription>Distribution of book fee payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <BooksPaymentStatusChart
              fullyPaid={fullyPaidBooks}
              partiallyPaid={partiallyPaidBooks}
              owing={owingBooks}
              noBooksRequired={noBooksRequired}
            />
          </CardContent>
        </Card>

        {/* Class Books Price Table */}
        <Card>
          <CardHeader>
            <CardTitle>Class Books Price Overview</CardTitle>
            <CardDescription>Book fees by class</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassBooksPriceTable
              booksConfig={booksConfig}
            />
          </CardContent>
        </Card>
      </div>

      {/* Books Purchase Chart */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <BooksPurchaseChart
          booksPurchasedByClass={booksPurchasedByClass}
          totalBooksPurchased={totalBooksPurchased}
          title="Books Purchase by Class"
          description="Number of students who have purchased books by class"
          showPurchasedOnly={true}
          fullyPaidByClass={fullyPaidByClass}
          partiallyPaidByClass={partiallyPaidByClass}
        />
      </div>



      {/* Student Books Payment Details */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Books Payment Details</CardTitle>
            <CardDescription>Individual student book fee payment status and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentBooksTable students={students} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}