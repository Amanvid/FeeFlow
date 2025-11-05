// Test with ultra-simple messages to check for content filtering
import { v4 as uuid } from 'uuid';

const API_KEY = process.env.FROG_API_KEY || 'test-api-key';
const USERNAME = process.env.FROG_USERNAME || 'test-username';
const FROG_API_BASE_URL = 'https://frogapi.wigal.com.gh/api/v3';

async function sendUltraSimpleSms(phone, message, senderId) {
  console.log(`Sending ultra-simple SMS to ${phone} with sender "${senderId}"`);
  console.log('Message:', message);
  
  try {
    const response = await fetch(`${FROG_API_BASE_URL}/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        senderid: senderId,
        destinations: [{
          destination: phone,
          message: message,
          msgid: `test-${uuid().slice(0, 4)}`,
          smstype: "text"
        }]
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { status: 'ERROR', message: error.message };
  }
}

async function testUltraSimpleSms() {
  const phoneNumbers = ['233241234567', '233536282694'];
  const ultraSimpleMessages = [
    'Test',
    'Hello',
    'Hi',
    'OK'
  ];
  
  console.log('🧪 Testing with ultra-simple messages to rule out content filtering');
  console.log('='.repeat(60));
  
  for (const phone of phoneNumbers) {
    console.log(`\n📱 Testing with phone: ${phone}`);
    console.log('-'.repeat(40));
    
    for (const message of ultraSimpleMessages) {
      console.log(`\n💬 Message: "${message}"`);
      
      const result = await sendUltraSimpleSms(phone, message, 'CHARIOT EDU');
      
      if (result.status === 'ACCEPTD') {
        console.log('✅ SMS accepted for processing');
        console.log('⚠️  Check if this ultra-simple message gets delivered');
      } else {
        console.log('❌ SMS failed:', result.message);
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎯 Ultra-simple message test completed!');
  console.log('If even "Test" or "Hi" doesn\'t get delivered, it\'s definitely an account/network issue');
}

testUltraSimpleSms().catch(console.error);