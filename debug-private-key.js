require('dotenv').config({ path: '.env.local' });

console.log('Debugging private key...');
console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
console.log('GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY?.length);

if (process.env.GOOGLE_PRIVATE_KEY) {
  const key = process.env.GOOGLE_PRIVATE_KEY;
  console.log('Key starts with BEGIN:', key.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('Key ends with END:', key.includes('-----END PRIVATE KEY-----'));
  console.log('Contains literal \\n:', key.includes('\\n'));
  console.log('Contains actual newlines:', key.includes('\n'));
  
  // Show first and last 50 characters
  console.log('First 50 chars:', key.substring(0, 50));
  console.log('Last 50 chars:', key.substring(key.length - 50));
  
  // Try the transformation
  let transformedKey = key.replace(/\\n/g, '\n').trim();
  console.log('\nAfter transformation:');
  console.log('Contains actual newlines:', transformedKey.includes('\n'));
  console.log('First 50 chars:', transformedKey.substring(0, 50));
  console.log('Last 50 chars:', transformedKey.substring(transformedKey.length - 50));
}