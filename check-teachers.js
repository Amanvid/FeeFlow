require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');

async function checkTeachers() {
  try {
    const doc = new GoogleSpreadsheet(process.env.NEXT_PUBLIC_SPREADSHEET_ID);
    
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    
    await doc.loadInfo();
    
    const teachersSheet = doc.sheetsByTitle['Teachers'];
    if (!teachersSheet) {
      console.log('Teachers sheet not found');
      return;
    }
    
    const rows = await teachersSheet.getRows();
    console.log('Teachers found:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. Username: "${row.get('Username')}", Password: "${row.get('Password')}"`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTeachers();