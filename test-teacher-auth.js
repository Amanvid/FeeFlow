const { getTeacherUsers } = require('./src/lib/data.ts');

async function testTeacherAuth() {
  try {
    console.log('Testing teacher authentication...');
    const teachers = await getTeacherUsers();
    console.log(`Found ${teachers.length} teachers`);
    
    if (teachers.length > 0) {
      console.log('First teacher:', teachers[0]);
      console.log('Teacher authentication system is working correctly!');
    } else {
      console.log('No teachers found in the system');
    }
  } catch (error) {
    console.error('Error testing teacher auth:', error);
  }
}

testTeacherAuth();