// Test script to verify invoice number generation logic
const testClaims = [
  { invoiceNumber: "CEC-INV--0001" },
  { invoiceNumber: "CEC-INV--0002" },
  { invoiceNumber: "CEC-INV--0003" },
  { invoiceNumber: "CEC-INV--0006" },
  { invoiceNumber: "TEST-1762367992496" }, // Should be ignored
  { invoiceNumber: "TEST-1762367992497" }, // Should be ignored
];

const padInvoiceNumber = (num) => num.toString().padStart(4, '0');

function generateNextInvoiceNumber(claims, prefix = 'CEC-INV') {
  const invoiceNumbers = claims
    .map(c => c.invoiceNumber)
    .filter(inv => inv && inv.startsWith(prefix))
    .map(inv => {
      // Extract the number part from format like "CEC-INV--0001"
      const numberPart = inv.replace(prefix, ''); // Remove prefix, leaves "--0001"
      const cleanNumber = numberPart.replace(/^-+/, ''); // Remove leading dashes, leaves "0001"
      return parseInt(cleanNumber, 10);
    })
    .filter(num => !isNaN(num));

  console.log('📊 Found invoice numbers:', invoiceNumbers);
  
  const lastNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) : 0;
  const nextNumber = lastNumber + 1;
  const newInvoiceNumber = `${prefix}--${padInvoiceNumber(nextNumber)}`;
  
  return {
    lastNumber,
    nextNumber,
    newInvoiceNumber
  };
}

console.log('🧪 Testing invoice number generation...\n');

console.log('Input claims:');
testClaims.forEach(claim => console.log(`  - ${claim.invoiceNumber}`));

console.log('\n' + '='.repeat(50));

const result = generateNextInvoiceNumber(testClaims);

console.log('\n📈 Results:');
console.log(`  Last number found: ${result.lastNumber}`);
console.log(`  Next number: ${result.nextNumber}`);
console.log(`  Generated invoice number: ${result.newInvoiceNumber}`);

console.log('\n' + '='.repeat(50));
console.log('✅ Test completed!');

// Test edge cases
console.log('\n🧪 Testing edge cases...\n');

// Test with empty claims
console.log('Empty claims:');
const emptyResult = generateNextInvoiceNumber([]);
console.log(`  Generated: ${emptyResult.newInvoiceNumber} (should be CEC-INV--0001)`);

// Test with only non-matching prefixes
console.log('\nOnly non-matching prefixes:');
const nonMatchingClaims = [
  { invoiceNumber: "OTHER-0001" },
  { invoiceNumber: "DIFFERENT-0002" }
];
const nonMatchingResult = generateNextInvoiceNumber(nonMatchingClaims);
console.log(`  Generated: ${nonMatchingResult.newInvoiceNumber} (should be CEC-INV--0001)`);