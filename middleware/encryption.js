const crypto = require('crypto');
const { publicKey, privateKey } = require('./keyLoader');

const encryptVote = (data) => {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

const decryptVote = (data) => {
  const buffer = Buffer.from(data, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

module.exports = {
  encryptVote,
  decryptVote,
};
