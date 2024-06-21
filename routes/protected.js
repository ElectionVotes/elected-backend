const express = require('express');
const isauth = require('../middleware/isAuth');

const router = express.Router();

router.get('/protected', isauth, (req, res) => {
  res.status(200).json({ msg: 'Vous êtes ici parce que vous êtes authentifié' });
});

module.exports = router;