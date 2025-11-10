// Count students exactly in the Metadata sheet
const SPREADSHEET_ID = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

async function countStudentsExactly() {
  console.log('Counting students exactly in Metadata sheet...');
  
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Could not fetch Metadata sheet: ${response.statusText}`);
      return;
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log(`Total lines in CSV: ${lines.length}`);
    console.log(`First line (header): ${lines[0]}`);
    console.log(`Last line: ${lines[lines.length - 1]}`);
    
    // Count data rows (excluding header)
    const dataRows = lines.slice(1); // Remove header
    console.log(`Data rows (excluding header): ${dataRows.length}`);
    
    // Check for empty lines or invalid data
    let validStudentRows = 0;
    dataRows.forEach((line, index) => {
      const columns = line.split(',');
      // Check if this looks like a valid student row (has student number and name)
      if (columns.length >= 2 && columns[0] && columns[1] && columns[1] !== '""' && columns[1].trim() !== '') {
        validStudentRows++;
        if (index < 5 || index >= dataRows.length - 5) {
          console.log(`Row ${index + 2}: ${columns[0]}, ${columns[1]}`);
        }
      } else {
        console.log(`Invalid row ${index + 2}: ${line}`);
      }
    });
    
    console.log(`\nValid student rows: ${validStudentRows}`);
    
    // Also check what the last student number is
    for (let i = dataRows.length - 1; i >= 0; i--) {
      const columns = dataRows[i].split(',');
      if (columns[0] && columns[0].trim() !== '') {
        console.log(`Last student number: ${columns[0]}`);
        console.log(`Last student name: ${columns[1]}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error counting students:', error.message);
  }
}

countStudentsExactly();