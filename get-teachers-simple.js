const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Simple function to parse private key
function parsePrivateKey(key) {
  if (!key) return null;
  // Handle various formats
  let parsedKey = key;
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    parsedKey = key;
  } else if (key.includes('BEGIN PRIVATE KEY')) {
    parsedKey = key.replace(/\\n/g, '\n');
  } else {
    // Assume it's a base64 encoded key or needs formatting
    parsedKey = key.replace(/\\n/g, '\n');
    if (!parsedKey.includes('BEGIN')) {
      parsedKey = `-----BEGIN PRIVATE KEY-----\n${parsedKey}\n-----END PRIVATE KEY-----`;
    }
  }
  return parsedKey;
}

async function getTeachers() {
  try {
    console.log('🔍 Looking for teacher credentials...');
    
    // Check if we have the required environment variables
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
    
    console.log('📧 Service Account Email:', serviceAccountEmail || 'NOT FOUND');
    console.log('🔑 Private Key:', privateKey ? 'FOUND (length: ' + privateKey.length + ')' : 'NOT FOUND');
    console.log('📊 Spreadsheet ID:', spreadsheetId || 'NOT FOUND');
    
    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      console.log('❌ Missing required environment variables');
      console.log('💡 Please check your .env.local file');
      return;
    }
    
    // Try to use the existing Google Sheets service
    const { googleSheetsService } = require('./src/lib/google-sheets.ts');
    
    console.log('📡 Fetching teachers from Google Sheets...');
    
    const response = await googleSheetsService.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Teachers!A:H',
    });
    
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      console.log('⚠️  No data found in Teachers sheet');
      return;
    }
    
    console.log('\n🎓 Available Teachers:');
    console.log('=' .repeat(60));
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = row[0] || 'N/A';
      const email = row[1] || 'N/A';
      const username = row[4] || 'N/A';
      const password = row[5] || 'N/A';
      const subject = row[6] || 'N/A';
      
      console.log(`\n👨‍🏫 Teacher ${i}:`);
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Subject: ${subject}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Use these credentials to log in at http://localhost:9002/teacher/login');
    
  } catch (error) {
    console.error('❌ Error fetching teachers:', error.message);
    console.log('\n💡 Trying alternative method...');
    
    // Try direct API call
    try {
      const response = await fetch('http://localhost:9002/api/debug/teachers');
      const data = await response.json();
      
      if (data.teachers && data.teachers.length > 0) {
        console.log('\n🎓 Available Teachers (from API):');
        console.log('='.repeat(60));
        
        data.teachers.forEach((teacher, i) => {
          console.log(`\n👨‍🏫 Teacher ${i + 1}:`);
          console.log(`   Name: ${teacher.name}`);
          console.log(`   Username: ${teacher.username}`);
          console.log(`   Password: ${teacher.password}`);
          console.log(`   Subject: ${teacher.subject}`);
        });
        
        console.log('\n' + '='.repeat(60));
      }
    } catch (apiError) {
      console.error('❌ API method also failed:', apiError.message);
    }
  }
}

// Run the function
getTeachers();