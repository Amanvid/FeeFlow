#!/usr/bin/env node

// Check for students with numbers > 149 or any other anomalies
async function checkForMissingNumbers() {
  console.log('🔍 Checking for Missing Student Numbers...');
  
  try {
    const spreadsheetId = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    const studentNumbers = [];
    
    // Collect all student numbers
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      
      const studentNumber = cells[0];
      const studentName = cells[1];
      
      if (studentNumber && studentName && 
          studentName !== '' && 
          studentName !== '""' &&
          !isNaN(parseInt(studentNumber)) &&
          parseInt(studentNumber) > 0) {
        studentNumbers.push(parseInt(studentNumber));
      }
    }
    
    console.log(`Found ${studentNumbers.length} students with numbers`);
    console.log(`Student number range: ${Math.min(...studentNumbers)} to ${Math.max(...studentNumbers)}`);
    
    // Check for missing numbers in sequence
    const sortedNumbers = [...studentNumbers].sort((a, b) => a - b);
    const missingNumbers = [];
    
    for (let i = 1; i <= 149; i++) {
      if (!sortedNumbers.includes(i)) {
        missingNumbers.push(i);
      }
    }
    
    console.log(`\nMissing student numbers from 1-149 sequence:`);
    console.log(missingNumbers);
    
    if (missingNumbers.length === 4) {
      console.log(`\n🎯 Found the issue! Students #${missingNumbers.join(', #')} are missing from the sheet.`);
      console.log(`This explains why you expect 149 but only see 145.`);
    }
    
    // Also check if there are any students with numbers > 149
    const highNumbers = studentNumbers.filter(n => n > 149);
    if (highNumbers.length > 0) {
      console.log(`\n⚠️  Found students with numbers > 149: ${highNumbers.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking numbers:', error);
  }
}

// Run the check
checkForMissingNumbers();