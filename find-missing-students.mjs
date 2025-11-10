#!/usr/bin/env node

// Deep dive analysis to find any missing student rows
async function findMissingStudents() {
  console.log('🔍 Deep Dive Analysis - Looking for Missing Students...');
  
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
    
    // Show ALL rows around the problematic area (rows 140-149)
    console.log('=== DETAILED ANALYSIS OF ROWS 140-149 ===');
    for (let i = 139; i < Math.min(lines.length, 149); i++) {
      const row = lines[i];
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      
      const studentNumber = cells[0];
      const studentName = cells[1];
      
      console.log(`\n--- Row ${i + 1} ---`);
      console.log(`Raw CSV: ${row}`);
      console.log(`Student Number: "${studentNumber}"`);
      console.log(`Student Name: "${studentName}"`);
      console.log(`First 5 cells: ${cells.slice(0, 5).map(c => `"${c}"`).join(' | ')}`);
      
      // Check various conditions
      const hasNumber = !!studentNumber;
      const hasName = !!studentName;
      const numberIsValid = !isNaN(parseInt(studentNumber)) && parseInt(studentNumber) > 0;
      const nameIsValid = studentName !== '' && studentName !== '""';
      
      console.log(`Has number: ${hasNumber}`);
      console.log(`Has name: ${hasName}`);
      console.log(`Number is valid: ${numberIsValid}`);
      console.log(`Name is valid: ${nameIsValid}`);
      console.log(`Would be counted as student: ${hasNumber && hasName && nameIsValid && numberIsValid}`);
    }
    
    // Now let's recount with different criteria
    console.log('\n=== RECOUNT WITH DIFFERENT CRITERIA ===');
    
    let count1 = 0; // Current criteria
    let count2 = 0; // More lenient criteria
    let count3 = 0; // Just check if there's any data in first 2 columns
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      
      const studentNumber = cells[0];
      const studentName = cells[1];
      
      // Current strict criteria
      if (studentNumber && studentName && 
          studentName !== '' && 
          studentName !== '""' &&
          !isNaN(parseInt(studentNumber)) &&
          parseInt(studentNumber) > 0) {
        count1++;
      }
      
      // More lenient - just check if both columns have some content
      if (studentNumber && studentName && 
          studentName !== '' && 
          !isNaN(parseInt(studentNumber))) {
        count2++;
      }
      
      // Even more lenient - just check if there's ANY content in first 2 columns
      if (studentNumber || studentName) {
        count3++;
      }
    }
    
    console.log(`Strict count (current): ${count1}`);
    console.log(`Lenient count: ${count2}`);
    console.log(`Any content count: ${count3}`);
    
    if (count2 === 149) {
      console.log('\n🎉 Found it! The lenient count gives 149 students.');
      console.log('The issue might be with the validation criteria being too strict.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing rows:', error);
  }
}

// Run the analysis
findMissingStudents();