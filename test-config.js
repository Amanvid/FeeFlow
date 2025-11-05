// Simple test to check school configuration
import { getSchoolConfig } from './src/lib/data';

async function testConfig() {
  try {
    const config = await getSchoolConfig();
    console.log('Sender ID being used:', config.senderId);
    console.log('SMS Enabled:', config.notifications.smsEnabled);
    console.log('School Name:', config.schoolName);
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

testConfig();