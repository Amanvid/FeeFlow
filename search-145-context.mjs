// Search for "145" in context of totals or students
const SPREADSHEET_ID = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

async function searchFor145Context() {
  const sheets = ['Summary', 'Config', 'Metadata'];
  
  for (const sheetName of sheets) {
    try {
      console.log(`\n=== Searching ${sheetName} sheet ===`);
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        
        if (text.includes('145')) {
          console.log(`Found '145' in ${sheetName} sheet:`);
          const lines = text.split('\n');
          
          lines.forEach((line, i) => {
            if (line.includes('145')) {
              const lowerLine = line.toLowerCase();
              // Check if this line contains context about totals or students
              if (lowerLine.includes('total') || 
                  lowerLine.includes('student') || 
                  lowerLine.includes('count') || 
                  lowerLine.includes('enroll')) {
                console.log(`  Line ${i+1}: ${line}`);
              }
            }
          });
        } else {
          console.log(`No '145' found in ${sheetName} sheet`);
        }
      }
    } catch (error) {
      console.error(`Error checking ${sheetName} sheet:`, error.message);
    }
  }
}

searchFor145Context();