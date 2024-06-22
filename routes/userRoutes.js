const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const emailVerification = require('../middleware/emailVerification'); // Add this line
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require("../models/Role");
const Election = require("../models/Election");
router.get("/user-elections/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await Role.find({ userId }).populate('electionId');

    const elections = roles.map(role => role.electionId);

    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/import', upload.single('file'), userController.importUsersFromExcel);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/', userController.getAllUsers);
router.post('/update-profile/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.use('/email-verification', emailVerification);

module.exports = router;
