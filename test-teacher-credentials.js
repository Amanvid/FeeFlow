const testCredentials = [
  { username: 'john.smith', password: 'teacher123' },
  { username: 'sarah.johnson', password: 'teacher456' },
  { username: 'michael.brown', password: 'teacher789' }
];

console.log('🎯 Available Teacher Credentials from Google Sheets:');
console.log('=' .repeat(60));

testCredentials.forEach((cred, i) => {
  console.log(`\n👨‍🏫 Teacher ${i + 1}:`);
  console.log(`   Username: ${cred.username}`);
  console.log(`   Password: ${cred.password}`);
});

console.log('\n' + '='.repeat(60));
console.log('💡 Try these credentials at: http://localhost:9002/teacher/login');
console.log('🔄 If these don\'t work, there might be a data parsing issue in the authentication code.');