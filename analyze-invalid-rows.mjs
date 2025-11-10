// Analyze what makes rows invalid
const SPREADSHEET_ID = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

async function analyzeInvalidRows() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Could not fetch Metadata sheet: ${response.statusText}`);
      return;
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log('Analyzing all rows:');
    
    // Show the last 10 rows in detail
    for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split(',');
      
      console.log(`\nRow ${i + 1}:`);
      console.log(`  Raw: ${line}`);
      console.log(`  Columns: ${columns.length}`);
      console.log(`  First column: "${columns[0]}"`);
      console.log(`  Second column: "${columns[1]}"`);
      
      // Check if this is a valid student row
      const isValidStudent = columns.length >= 2 && 
                            columns[0] && 
                            columns[1] && 
                            columns[1] !== '""' && 
                            columns[1].trim() !== '' &&
                            !isNaN(parseInt(columns[0].replace(/"/g, '').trim()));
      
      console.log(`  Is valid student: ${isValidStudent}`);
      
      if (!isValidStudent && i > 0) {
        console.log(`  This appears to be: ${columns[0] === '""' ? 'Empty row' : columns[6] && columns[6].includes('GHS') ? 'Summary/total row' : 'Other'}`);
      }
    }
    
    // Count valid students more accurately
    let validCount = 0;
    let lastValidStudentNumber = 0;
    
    for (let i = 1; i < lines.length; i++) { // Skip header
      const columns = lines[i].split(',');
      const studentNumber = parseInt(columns[0].replace(/"/g, '').trim());
      
      if (columns[0] && columns[1] && columns[1] !== '""' && !isNaN(studentNumber)) {
        validCount++;
        lastValidStudentNumber = studentNumber;
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total lines: ${lines.length}`);
    console.log(`Valid student rows: ${validCount}`);
    console.log(`Last valid student number: ${lastValidStudentNumber}`);
    
  } catch (error) {
    console.error('Error analyzing rows:', error.message);
  }
}

analyzeInvalidRows();