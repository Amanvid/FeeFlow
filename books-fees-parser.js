// Books Fees Data Parser
// This script parses the books fees data you provided

const booksFeesData = `
GHS 200.00 	 
GHS 200.00 	 
GHS 40.00 	 GHS 40.00 
GHS 300.00 	 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 250.00 
 	 GHS 100.00 
GHS 300.00 	 
GHS 300.00 	 GHS 50.00 
 	 
GHS 300.00 	 GHS 300.00 
 	 
GHS 40.00 	 GHS 40.00 
GHS 300.00 	 GHS 50.00 
 	 
GHS 300.00 	 GHS 30.00 
 	 
 	 
GHS 300.00 	 GHS 300.00 
 	 
GHS 300.00 	 
GHS 300.00 	 
 	 
 	 
GHS 300.00 	 GHS 100.00 
 	 
 	 
GHS 40.00 	 GHS 40.00 
GHS 300.00 	 GHS 200.00 
 	 
 	 
 	 
 	 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 200.00 
GHS 300.00 	 
 	 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 200.00 
GHS 300.00 	 GHS 200.00 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 GHS 200.00 
GHS 300.00 	 GHS 300.00 
GHS 240.00 	 GHS 200.00 
 	 GHS 420.00 
GHS 300.00 	 GHS 300.00 
 	 
GHS 300.00 	 GHS 200.00 
GHS 300.00 	 GHS 300.00 
GHS 300.00 	 
GHS 300.00 	 GHS 100.00 
GHS 300.00 	 GHS 200.00 
GHS 420.00 	 GHS 260.00 
GHS 420.00 	 
GHS 420.00 	 GHS 200.00 
GHS 420.00 	 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 100.00 
GHS 420.00 	 GHS 200.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 320.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 
GHS 420.00 	 GHS 300.00 
GHS 420.00 	 GHS 360.00 
 	 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 400.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 200.00 
GHS 90.00 	 GHS 90.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 220.00 
GHS 420.00 	 GHS 200.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 150.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 250.00 
GHS 420.00 	 GHS 420.00 
 	 
GHS 420.00 	 GHS 420.00 
 	 
GHS 420.00 	 GHS 420.00 
 	 
GHS 420.00 	 GHS 350.00 
 	 
GHS 420.00 	 GHS 420.00 
 	 
GHS 420.00 	 GHS 150.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 250.00 
GHS 420.00 	 GHS 420.00 
GHS 420.00 	 GHS 400.00 
GHS 420.00 	 GHS 400.00 
 	 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 100.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 400.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 300.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 440.00 
 	 
GHS 500.00 	 GHS 400.00 
GHS 500.00 	 GHS 270.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 440.00 
 	 
GHS 500.00 	 GHS 255.00 
GHS 500.00 	 GHS 400.00 
 	 
GHS 500.00 	 GHS 500.00 
GHS 500.00 	 GHS 500.00 
 	 GHS 300.00 
GHS 520.00 	 GHS 100.00 
GHS 520.00 	 GHS 300.00 
GHS 520.00 	 GHS 200.00 
 	 
GHS 520.00 	 GHS 520.00 
GHS 520.00 	 GHS 400.00 
GHS 520.00 	 GHS 200.00 
GHS 520.00 	 GHS 520.00 
GHS 520.00 	 GHS 400.00 
 	 GHS 31,645.00
`;

// Parse the books fees data
function parseBooksFeesData(data) {
  const lines = data.trim().split('\n');
  const results = [];
  
  lines.forEach((line, index) => {
    const [booksFee, payment] = line.split('\t').map(item => item.trim());
    
    results.push({
      index: index + 1,
      booksFee: booksFee || 'Not specified',
      payment: payment || 'Not paid',
      hasPayment: payment && payment !== ''
    });
  });
  
  return results;
}

// Analyze the data
function analyzeBooksFeesData(data) {
  const parsed = parseBooksFeesData(data);
  
  const totalStudents = parsed.length;
  const studentsWithPayments = parsed.filter(item => item.hasPayment).length;
  const studentsWithoutPayments = totalStudents - studentsWithPayments;
  
  // Extract numeric values for calculations
  const extractAmount = (str) => {
    if (!str || str === 'Not specified' || str === 'Not paid') return 0;
    const match = str.match(/GHS ([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  };
  
  const totalBooksFees = parsed.reduce((sum, item) => sum + extractAmount(item.booksFee), 0);
  const totalPayments = parsed.reduce((sum, item) => sum + extractAmount(item.payment), 0);
  const outstandingBalance = totalBooksFees - totalPayments;
  
  // Group by fee amounts
  const feeGroups = {};
  parsed.forEach(item => {
    const fee = item.booksFee;
    feeGroups[fee] = (feeGroups[fee] || 0) + 1;
  });
  
  return {
    totalStudents,
    studentsWithPayments,
    studentsWithoutPayments,
    totalBooksFees,
    totalPayments,
    outstandingBalance,
    paymentRate: (studentsWithPayments / totalStudents * 100).toFixed(1),
    feeGroups
  };
}

// Run analysis
const analysis = analyzeBooksFeesData(booksFeesData);

console.log('=== BOOKS FEES ANALYSIS ===');
console.log(`Total Students: ${analysis.totalStudents}`);
console.log(`Students with Payments: ${analysis.studentsWithPayments}`);
console.log(`Students without Payments: ${analysis.studentsWithoutPayments}`);
console.log(`Payment Rate: ${analysis.paymentRate}%`);
console.log(`\nFinancial Summary:`);
console.log(`Total Books Fees: GHS ${analysis.totalBooksFees.toLocaleString()}`);
console.log(`Total Payments Received: GHS ${analysis.totalPayments.toLocaleString()}`);
console.log(`Outstanding Balance: GHS ${analysis.outstandingBalance.toLocaleString()}`);
console.log(`\nFee Distribution:`);
Object.entries(analysis.feeGroups).forEach(([fee, count]) => {
  console.log(`${fee}: ${count} students`);
});

module.exports = { parseBooksFeesData, analyzeBooksFeesData };