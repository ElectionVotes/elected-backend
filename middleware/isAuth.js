const jwt = require('jsonwebtoken');
require('dotenv').config();

const isauth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Invalid token', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = isauth;
