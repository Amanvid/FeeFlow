// Test different ways to load the private key
const fs = require('fs');
const path = require('path');

console.log('Testing environment variable parsing...\n');

// Method 1: Standard dotenv
require('dotenv').config({ path: '.env.local' });
console.log('1. Standard dotenv:');
console.log('   GOOGLE_PRIVATE_KEY length:', process.env.GOOGLE_PRIVATE_KEY?.length);
console.log('   Contains BEGIN:', process.env.GOOGLE_PRIVATE_KEY?.includes('-----BEGIN PRIVATE KEY-----'));
console.log('   Contains END:', process.env.GOOGLE_PRIVATE_KEY?.includes('-----END PRIVATE KEY-----'));

// Method 2: Read file directly and parse
console.log('\n2. Manual file parsing:');
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let privateKey = '';
let inPrivateKey = false;

for (const line of lines) {
  if (line.startsWith('GOOGLE_PRIVATE_KEY=')) {
    privateKey = line.replace('GOOGLE_PRIVATE_KEY=', '');
    inPrivateKey = true;
  } else if (inPrivateKey && line.startsWith('NEXT_PUBLIC_')) {
    break;
  } else if (inPrivateKey && line.trim() && !line.includes('=')) {
    privateKey += '\n' + line;
  }
}

console.log('   Manual parsed key length:', privateKey.length);
console.log('   Contains BEGIN:', privateKey.includes('-----BEGIN PRIVATE KEY-----'));
console.log('   Contains END:', privateKey.includes('-----END PRIVATE KEY-----'));

// Method 3: Use a different approach - load from separate file
console.log('\n3. Testing with properly formatted key file:');
const properKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCuegps5tyFDJNM
+2TIUER547OS/09iXN2E5Plq1fstqNMG+5QoghAEmoL8yqnCrT9s/swRfIyfa7aq
R/0MsS5yslCNIrhWMkhHC1vXvebRkGcIVWhql92nGDcTuXgFEy6cU0sHt1gzf4QQ
vfoUZxfwH2eTjo8qrSsp2d9HK/O1N3k1NQR+PqpG2J5jSXpkkLkT2nAkDRfvbRq6
QgJHv1n+iauStV6oTorRVTkKl3lUNvatFCP4vB0QgBawr2IDrJDTZvxHOwmyQnvI
dFSJuNeJeR3feSer2IIneyyeMXvH/rFinO35SYtWGRGlHmoF7Hm37KpAmcl94h1O
W6PPkLefAgMBAAECggEAEz6BvN4/z2sCKjkGNjPoQZt0WI/RdTNx+XD586czY6dd
00TXZBpoYuGZ9gDydXb/amm2H22h4wmR5bk393jpexwg11hPha5ZG4DsueCHv3CS
dLBa6nrip0X7+TB5RPIHL5XeTjUSROfZLLGPjkWKteD43yUXtGjSPHT79BEseb28
ej612KTvQxprZdxvvV08kqUTCL1hIUfGgMBgAoPbj7XMTMVgOlUailek09vNnDI5
E5pqlhkpBkgnHAv3n1P5Oj8eY/Y32P0vsUX4UHedlz0TH3vS7IUKY02qxlg38wKB
GqaeoMypmokobazznnBzSKA3PPHbaXHC5rmJYX69NQKBgQDaoYQ2gbSAUNo4HQ5r
f4Cc0K0u12TVnaxIYC7lFpIGjTXWs8dPPXwRdy5jCsMs6yZs7vCZRCx2yuBUVS9C
JRpcXrrwRw6IRtlPXOKe39Kre/kihTl1MvbwYJK6BlHvdG6RbqyauS1eys0rFSnj
MWMOLI3J97tgDXRMp65A56bNFQKBgQDMTH/E0a1aNoglxeQpup5SszVFM6OtaOaH
bgAImhmLM6gVlwfOpyP4JB54zb9Q4/Y7hC6MngKxJYOE8KrUVe9qi4CxkI73jtMz
YXhU1xv70nlvVfcm7GhGaymb8LaCUEDX7iPzb+AGQMp+gApL9L6fsNuYna9rtnl0
V2b1isjm4wKBgB8kOIfnC8XnPl4VzXMEc1Zi5vgwGB3RWrPod2WMRHqIbK3LZ81i
raRzPHlBFDH2wL9tfXnnWwoEtdVtWNDsJggYOjp1dJ12sgd67JDCwuhIPWFsZpXK
D6CHsP6sXclk5Ubz48QaMls5OeY0GoZRB5ICSKQHFHqHEBTHIav/EyRNAoGAXv2S
yujTOYbxdt60X9KtmrZIpoyEJjUIOyAiU92S0u6J0MAQmT2Ns+rXYEQKGIpmCvZC
zo8JoWRX6pAcXe43C8shY25biy+Vc+Z2FLyP/l62p9XIvQhe058wEZmywpSeEchg
Xug9uaqWfIr8PqTlnUqWUDfBQMvvXPDmpnSJRRECgYASk261o9MJA+DZga5eKrdH
kKTHfwVboMNZ+ydZ2hTt6BURxqgslqK7YAknaD39w4QIR0YmaRlxVB+clhPWC2C4
I5A/CYWz/gk++0SWBqbODf14vH+nVnwRPQweesZdZWtmtDbSXdaAG+BDmi80Ea95
OUw7+as1HEdglKaQnH+DqA==
-----END PRIVATE KEY-----`;

console.log('   Proper key length:', properKey.length);
console.log('   Proper key format works:', properKey.includes('-----BEGIN PRIVATE KEY-----') && properKey.includes('-----END PRIVATE KEY-----'));