const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Service Account Credentials...\n');

// Check .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract service account email
  const emailMatch = envContent.match(/GOOGLE_SERVICE_ACCOUNT_EMAIL=(.+)/);
  if (emailMatch) {
    console.log('📧 Service Account Email from .env.local:', emailMatch[1]);
  }
  
  // Extract spreadsheet ID
  const sheetIdMatch = envContent.match(/NEXT_PUBLIC_SPREADSHEET_ID=(.+)/);
  if (sheetIdMatch) {
    console.log('📊 Spreadsheet ID from .env.local:', sheetIdMatch[1]);
  }
}

// Check private key file
const privateKeyPath = path.join(process.cwd(), 'google-private-key.pem');
if (fs.existsSync(privateKeyPath)) {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  console.log('🔑 Private key file exists, length:', privateKey.length);
  
  // Try to extract info from private key (this is just for debugging)
  const keyLines = privateKey.split('\n');
  console.log('First few lines of private key:');
  keyLines.slice(0, 3).forEach(line => console.log('  ', line));
}

console.log('\n📝 To fix the "invalid_grant: account not found" error:');
console.log('1. Verify the service account email matches the private key');
console.log('2. Check that the service account has access to the spreadsheet');
console.log('3. Ensure the Google Sheets API is enabled in your Google Cloud project');
console.log('4. Make sure the service account email is added as an editor to the spreadsheet');

console.log('\n🔧 Suggested next steps:');
console.log('- Check your Google Cloud Console for the correct service account email');
console.log('- Verify the spreadsheet is shared with the service account');
console.log('- Test with a new service account if needed');