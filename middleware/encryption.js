const crypto = require('crypto');
const { publicKey, privateKey } = require('./keys');

const encrypt = (data) => {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

const decrypt = (encrypted) => {
  const buffer = Buffer.from(encrypted, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

module.exports = { encrypt, decrypt };
