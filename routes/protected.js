const express = require('express');
const isauth = require('../middleware/isAuth');

const router = express.Router();

router.get('/protected', isauth, (req, res) => {
  res.status(200).json({ msg: 'Vous êtes ici parce que vous êtes authentifié' });
});
router.post('/update-profile', isauth, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword, isTemporaryPassword: false });
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;