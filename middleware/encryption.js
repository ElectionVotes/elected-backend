const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load public and private keys
const publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public.pem'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private.pem'), 'utf8');

// Function to encrypt data
const encrypt = (data) => {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

// Function to decrypt data
const decrypt = (encryptedData) => {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

module.exports = { encrypt, decrypt };
