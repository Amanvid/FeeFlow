const { getAdminUsers } = require('./src/lib/data.ts');

async function testAdminUsers() {
  try {
    console.log('Fetching admin users...');
    const adminUsers = await getAdminUsers();
    console.log('Admin users found:', adminUsers);
    
    // Check if SuperAdmin exists
    const superAdmin = adminUsers.find(user => user.username === 'SuperAdmin');
    if (superAdmin) {
      console.log('SuperAdmin found:', superAdmin);
    } else {
      console.log('SuperAdmin NOT found in admin users');
      console.log('Available admin users:', adminUsers.map(u => u.username));
    }
  } catch (error) {
    console.error('Error fetching admin users:', error);
  }
}

testAdminUsers();