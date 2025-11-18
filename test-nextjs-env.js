// Test environment variable loading like Next.js
require('dotenv').config({ path: '.env.local' });

console.log('FROG_API_KEY:', process.env.FROG_API_KEY);
console.log('FROG_USERNAME:', process.env.FROG_USERNAME);
console.log('API_KEY length:', process.env.FROG_API_KEY?.length);

// Test the actual values used in actions.ts
const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

console.log('API_KEY in actions.ts:', API_KEY);
console.log('USERNAME in actions.ts:', USERNAME);
console.log('API_KEY length in actions.ts:', API_KEY?.length);