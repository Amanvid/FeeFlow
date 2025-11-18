// The current key in .env.local is a bcrypt hash that contains the actual API key
const bcryptKey = "$2y$10$6oYYcjc6Ge3/W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe";

// Extract the part that looks like the actual API key
// The pattern suggests the real key starts after the bcrypt prefix
const parts = bcryptKey.split('$');
console.log('Bcrypt parts:', parts);

// The actual API key appears to be: /W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe
// But the server is showing 42 characters starting with /W.P.1Yqk6
// Let's extract what the server is actually seeing

const extractedKey = "/W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe";
console.log('Extracted key length:', extractedKey.length);
console.log('Extracted key:', extractedKey);
console.log('First 10 chars:', extractedKey.substring(0, 10));

// The server shows 42 characters, so let's see what that would be
const serverKey = extractedKey.substring(0, 42);
console.log('Server key (42 chars):', serverKey);
console.log('Server key length:', serverKey.length);