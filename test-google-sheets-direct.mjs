// Direct test to check Google Sheets for "Total Students" data
const SPREADSHEET_ID = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

async function checkGoogleSheetsForTotalStudents() {
  console.log('Checking Google Sheets for "Total Students" data...');
  console.log(`Using spreadsheet ID: ${SPREADSHEET_ID}`);
  
  const sheets = ['Summary', 'Config', 'Metadata'];
  
  for (const sheetName of sheets) {
    try {
      console.log(`\n--- Checking ${sheetName} sheet ---`);
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Could not fetch ${sheetName} sheet: ${response.statusText}`);
        continue;
      }
      
      const csvText = await response.text();
      console.log(`Raw CSV data (first 300 chars):`);
      console.log(csvText.substring(0, 300));
      
      // Look for "Total Students" pattern
      const totalStudentsMatch = csvText.match(/Total Students\s+(\d+)/i);
      if (totalStudentsMatch) {
        console.log(`✅ FOUND: "Total Students ${totalStudentsMatch[1]}" in ${sheetName} sheet`);
      } else {
        console.log(`No "Total Students" pattern found in ${sheetName} sheet`);
        
        // For Metadata sheet, count the rows
        if (sheetName === 'Metadata') {
          const lines = csvText.trim().split('\n');
          const rowCount = lines.length;
          if (rowCount > 0) {
            const studentCount = rowCount - 1; // Subtract header
            console.log(`Metadata sheet has ${studentCount} student records`);
          }
        }
      }
      
      // Also check for "145" specifically
      if (csvText.includes('145')) {
        console.log(`Found number "145" in ${sheetName} sheet`);
        // Find context around 145
        const lines = csvText.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('145')) {
            console.log(`Line ${index + 1}: ${line}`);
          }
        });
      }
      
    } catch (error) {
      console.error(`Error checking ${sheetName} sheet:`, error.message);
    }
  }
}

// Run the check
checkGoogleSheetsForTotalStudents();