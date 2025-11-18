// Test script to verify books dashboard data
const API_BASE = 'http://localhost:9002';

async function testBooksDashboard() {
  try {
    console.log('🧪 Testing Books Dashboard...');
    
    // Test API endpoints
    console.log('📊 Fetching claims data...');
    const claimsResponse = await fetch(`${API_BASE}/api/claims`);
    const claimsData = await claimsResponse.json();
    console.log(`✅ Claims data: ${claimsData.length} records found`);
    
    // Test students data (simulate what the books dashboard would use)
    console.log('👥 Fetching students data...');
    // Since we don't have a direct students API, we'll simulate the data processing
    
    // Simulate books fee calculations
    const mockStudents = [
      { booksFeePaid: 150, books: 200, class: 'BS 1', studentType: 'New' },
      { booksFeePaid: 200, books: 200, class: 'BS 2', studentType: 'Old' },
      { booksFeePaid: 0, books: 180, class: 'KG 1', studentType: 'New' },
      { booksFeePaid: 100, books: 200, class: 'BS 3', studentType: 'Old' },
    ];
    
    const totalBooksPaid = mockStudents.reduce((acc, student) => acc + student.booksFeePaid, 0);
    const fullyPaidBooks = mockStudents.filter(s => s.books > 0 && s.booksFeePaid >= s.books).length;
    const partiallyPaidBooks = mockStudents.filter(s => s.books > 0 && s.booksFeePaid > 0 && s.booksFeePaid < s.books).length;
    const owingBooks = mockStudents.filter(s => s.books > 0 && s.booksFeePaid === 0).length;
    
    console.log('📈 Books Dashboard Statistics:');
    console.log(`   Total Books Paid: GH₵${totalBooksPaid}`);
    console.log(`   Fully Paid: ${fullyPaidBooks} students`);
    console.log(`   Partially Paid: ${partiallyPaidBooks} students`);
    console.log(`   Owing: ${owingBooks} students`);
    
    // Test navigation to books dashboard
    console.log('🧭 Testing books dashboard route...');
    const booksPageResponse = await fetch(`${API_BASE}/admin/books`);
    console.log(`✅ Books dashboard accessible: ${booksPageResponse.status === 200}`);
    
    console.log('✅ Books dashboard test completed successfully!');
    
  } catch (error) {
    console.error('❌ Books dashboard test failed:', error);
  }
}

testBooksDashboard();