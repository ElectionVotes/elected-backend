const fs = require('fs');
const path = require('path');

// Load public and private keys with logging
let publicKey, privateKey;
try {
  publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public_key.pem'), 'utf8');
  console.log('Public key loaded successfully');
} catch (err) {
  console.error('Error loading public key:', err);
  process.exit(1);
}

try {
  privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private_key.pem'), 'utf8');
  console.log('Private key loaded successfully');
} catch (err) {
  console.error('Error loading private key:', err);
  process.exit(1);
}

module.exports = { publicKey, privateKey };
