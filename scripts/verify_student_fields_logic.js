var headers = [
    'No.', 'Name', 'Gender', 'Grade', 'Student Type', 'School Fees Amount',
    'Books Fees', 'Intial Amount Paid', 'Arrears', 'Total Balance',
    'Remaining Balance', 'Guardian Name', 'Guardian Phone', 'Location',
    'Admission Date', 'Notes', 'Payment Method'
];

var body = {
    name: 'Test Student',
    grade: 'Class 1',
    studentType: 'New',
    gender: 'Male',
    guardianName: 'Test Parent',
    guardianPhone: '233541234567',
    schoolFeesAmount: 1000,
    initialAmountPaid: 500,
    admissionDate: '2024-01-01',
    notes: 'Test Note',
    paymentMethod: 'Momo'
};

console.log('--- Verification Script ---');
console.log('Headers:', headers);
console.log('Input Body:', body);

var newStudentRow = new Array(headers.length).fill('');
var currentRow = 10; // Mock current row

headers.forEach(function (header, index) {
    var headerLower = header.toLowerCase();

    if (headerLower.includes('no.')) {
        newStudentRow[index] = '1';
    } else if (headerLower.includes('name')) {
        newStudentRow[index] = body.name;
    } else if (headerLower.includes('gender')) {
        newStudentRow[index] = body.gender || 'Other';
    } else if (headerLower.includes('grade')) {
        newStudentRow[index] = body.grade;
    } else if (headerLower.includes('student type')) {
        newStudentRow[index] = 'New';
    } else if (headerLower.includes('parent name') || headerLower.includes('guardian name')) {
        newStudentRow[index] = body.guardianName;
    } else if (headerLower.includes('contact') || headerLower.includes('phone')) {
        newStudentRow[index] = body.guardianPhone;
    } else if (headerLower.includes('admission date') || headerLower.includes('date')) {
        newStudentRow[index] = body.admissionDate || new Date().toISOString().split('T')[0];
    } else if (headerLower.includes('remark') || headerLower.includes('note')) {
        newStudentRow[index] = body.notes || '';
    } else if (headerLower.includes('payment method') || headerLower.includes('mode')) {
        newStudentRow[index] = body.paymentMethod || 'Cash';
    }
});

console.log('mapped row:', newStudentRow);

// Assertions
var dateIndex = headers.indexOf('Admission Date');
var notesIndex = headers.indexOf('Notes');
var methodIndex = headers.indexOf('Payment Method');

if (newStudentRow[dateIndex] === body.admissionDate &&
    newStudentRow[notesIndex] === body.notes &&
    newStudentRow[methodIndex] === body.paymentMethod) {
    console.log('✅ SUCCESS: All new fields mapped correctly.');
} else {
    console.log('❌ FAILURE: Fields not mapped correctly.');
    console.log('Expected:', body.admissionDate, body.notes, body.paymentMethod);
    console.log('Actual:', newStudentRow[dateIndex], newStudentRow[notesIndex], newStudentRow[methodIndex]);
}
