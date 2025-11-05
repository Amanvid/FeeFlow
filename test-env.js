// Test environment variable loading
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Test:');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : 'NOT SET');
console.log('GOOGLE_PRIVATE_KEY preview:', process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.substring(0, 50) + '...' : 'NOT SET');
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
console.log('NEXT_PUBLIC_SPREADSHEET_ID:', process.env.NEXT_PUBLIC_SPREADSHEET_ID);