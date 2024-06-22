const crypto = require('crypto');
const { publicKey, privateKey } = require('../middleware/keyLoader');

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
