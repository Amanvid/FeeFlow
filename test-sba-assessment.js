const { getSBAAssessmentData } = require('./src/lib/sba-assessment.ts');

async function testSBAAssessment() {
  try {
    console.log('Testing getSBAAssessmentData...');
    const result = await getSBAAssessmentData(
      '123-abubakarifatmat-123',
      'BS 2',
      'Mathematics',
      'Term 1'
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSBAAssessment();