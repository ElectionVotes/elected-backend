const fs = require('fs');
const path = require('path');

const loadKey = (fileName) => {
  const filePath = path.resolve(__dirname, '../keys', fileName);
  return fs.readFileSync(filePath, 'utf8');
};

module.exports = {
  privateKey: loadKey('private_key.pem'),
  publicKey: loadKey('public_key.pem'),
};
