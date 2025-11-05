// Simple SMS test with minimal message
import { v4 as uuid } from 'uuid';

const API_KEY = process.env.FROG_API_KEY || 'test-api-key';
const USERNAME = process.env.FROG_USERNAME || 'test-username';
const FROG_API_BASE_URL = 'https://frogapi.wigal.com.gh/api/v3';

async function sendSimpleSms(phone, message, senderId) {
  console.log(`Sending simple SMS to ${phone} with sender "${senderId}"`);
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

async function testSimpleSms() {
  const phoneNumbers = ['233241234567', '233536282694'];
  const senderIds = ['CHARIOT EDU', 'WIGAL', 'INFO'];
  const messages = [
    'Test message from Chariot EDU',
    'Simple test',
    'Hello, this is a test message'
  ];
  
  for (const senderId of senderIds) {
    console.log(`\n🧪 Testing sender ID: ${senderId}`);
    console.log('='.repeat(50));
    
    for (const phone of phoneNumbers) {
      for (const message of messages) {
        console.log(`\n📱 Phone: ${phone}`);
        console.log(`💬 Message: "${message}"`);
        
        const result = await sendSimpleSms(phone, message, senderId);
        
        if (result.status === 'ACCEPTD') {
          console.log('✅ SMS accepted for processing');
        } else {
          console.log('❌ SMS failed:', result.message);
        }
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

testSimpleSms().catch(console.error);