#!/usr/bin/env node

// Comprehensive analysis of all rows in the Metadata sheet
async function analyzeAllRows() {
  console.log('🔍 Comprehensive Analysis of Metadata Sheet...');
  
  try {
    const spreadsheetId = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log(`📊 Total lines in CSV: ${lines.length}`);
    console.log('');
    
    let validStudents = 0;
    let invalidRows = [];
    let lastValidStudent = null;
    
    // Process each row
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      
      const studentNumber = cells[0];
      const studentName = cells[1];
      
      // Check if this is a valid student row
      const isValid = studentNumber && studentName && 
                     studentName !== '' && 
                     studentName !== '""' &&
                     !isNaN(parseInt(studentNumber)) &&
                     parseInt(studentNumber) > 0;
      
      if (i === 0) {
        // Header row
        console.log(`Row ${i + 1} (HEADER): ${studentNumber} - ${studentName}`);
      } else if (isValid) {
        validStudents++;
        lastValidStudent = { row: i + 1, number: studentNumber, name: studentName };
        
        // Show first few and last few valid students
        if (validStudents <= 5 || i >= lines.length - 5) {
          console.log(`Row ${i + 1}: ✅ ${studentNumber} - ${studentName}`);
        } else if (validStudents === 6) {
          console.log('... (middle rows skipped) ...');
        }
      } else {
        // Invalid row - show details
        invalidRows.push({
          row: i + 1,
          studentNumber: studentNumber || '(empty)',
          studentName: studentName || '(empty)',
          firstFewCells: cells.slice(0, 5).join(' | ')
        });
      }
    }
    
    console.log('');
    console.log('=== INVALID ROWS ===');
    invalidRows.forEach(invalid => {
      console.log(`Row ${invalid.row}: ❌ ${invalid.studentNumber} - ${invalid.studentName}`);
      console.log(`    First few cells: ${invalid.firstFewCells}`);
      console.log('');
    });
    
    console.log('=== SUMMARY ===');
    console.log(`Total lines: ${lines.length}`);
    console.log(`Header rows: 1`);
    console.log(`Valid student rows: ${validStudents}`);
    console.log(`Invalid/summary rows: ${invalidRows.length}`);
    console.log(`Last valid student: Row ${lastValidStudent?.row} - ${lastValidStudent?.number} - ${lastValidStudent?.name}`);
    
    if (validStudents === 149) {
      console.log('\n🎉 SUCCESS: Found exactly 149 students!');
    } else {
      console.log(`\n⚠️  Found ${validStudents} students (expected 149)`);
      console.log(`The difference is: ${149 - validStudents} rows`);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing rows:', error);
  }
}

// Run the analysis
analyzeAllRows();