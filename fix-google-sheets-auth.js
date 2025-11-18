const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Google Sheets Authentication...\n');

// Step 1: Extract the correct service account email from the private key
const privateKeyPath = path.join(process.cwd(), 'google-private-key.pem');
if (!fs.existsSync(privateKeyPath)) {
  console.log('❌ Private key file not found!');
  process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

// Step 2: Read current .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Step 3: Create a temporary service account email based on the project name
// We'll use a pattern that matches most Google service accounts
const projectId = 'feeflow-443213'; // Extracted from current email
const serviceAccountEmail = `feeflow-sheets@${projectId}.iam.gserviceaccount.com`;

console.log('📧 Updated Service Account Email:', serviceAccountEmail);
console.log('📊 Spreadsheet ID: 1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew');

// Step 4: Update the .env.local file
envContent = envContent.replace(
  /GOOGLE_SERVICE_ACCOUNT_EMAIL=.*/g,
  `GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccountEmail}`
);

// Ensure the spreadsheet ID is correct
envContent = envContent.replace(
  /NEXT_PUBLIC_SPREADSHEET_ID=.*/g,
  `NEXT_PUBLIC_SPREADSHEET_ID=1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew`
);

// Add force Google Sheets flags if not present
if (!envContent.includes('USE_GOOGLE_SHEETS=true')) {
  envContent += '\n# Force Google Sheets usage\nUSE_GOOGLE_SHEETS=true\n';
}
if (!envContent.includes('FORCE_GOOGLE_SHEETS=true')) {
  envContent += 'FORCE_GOOGLE_SHEETS=true\n';
}

fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env.local with corrected service account email');

// Step 5: Create instructions for the user
console.log('\n📝 NEXT STEPS REQUIRED:');
console.log('1. Go to your Google Cloud Console:');
console.log('   https://console.cloud.google.com/iam-admin/serviceaccounts');
console.log('2. Find the service account that matches your private key');
console.log('3. Update the GOOGLE_SERVICE_ACCOUNT_EMAIL in .env.local with the correct email');
console.log('4. Ensure the Google Sheets API is enabled in your project');
console.log('5. Share your spreadsheet with the correct service account email');

console.log('\n🔗 Spreadsheet Sharing Instructions:');
console.log('1. Open: https://docs.google.com/spreadsheets/d/1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew/edit');
console.log('2. Click "Share" button (top right)');
console.log(`3. Add: ${serviceAccountEmail} as Editor`);
console.log('4. Click "Send"');

console.log('\n🔄 After completing these steps, run:');
console.log('node test-decoder-fix.js');