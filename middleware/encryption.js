const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load public and private keys
let publicKey, privateKey;
try {
  publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public.pem'), 'utf8');
  privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private.pem'), 'utf8');
} catch (err) {
  console.error('Error loading keys:', err);
  process.exit(1); // Exit the process if keys cannot be loaded
}

// Function to encrypt data
const encrypt = (data) => {
  try {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  } catch (err) {
    console.error('Error encrypting data:', err);
    throw err; // Rethrow the error to be handled by the calling function
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
    throw err; // Rethrow the error to be handled by the calling function
  }
};

module.exports = { encrypt, decrypt };
