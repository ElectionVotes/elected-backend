const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load public and private keys with logging
let publicKey, privateKey;
try {
  publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public.pem'), 'utf8');
  console.log('Public key loaded successfully');
} catch (err) {
  console.error('Error loading public key:', err);
  process.exit(1);
}

try {
  privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private.pem'), 'utf8');
  console.log('Private key loaded successfully');
} catch (err) {
  console.error('Error loading private key:', err);
  process.exit(1);
}

// Function to encrypt data
const encrypt = (data) => {
  try {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  } catch (err) {
    console.error('Error encrypting data:', err);
    throw err;
  }
};

// Function to decrypt data
const decrypt = (encryptedData) => {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Error decrypting data:', err);
    throw err;
  }
};

module.exports = { encrypt, decrypt };
