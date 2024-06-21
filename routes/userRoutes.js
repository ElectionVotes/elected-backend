const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const emailVerification = require('../middleware/emailVerification'); // Add this line

router.post('/import', upload.single('file'), userController.importUsersFromExcel);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/', userController.getAllUsers);
router.post('/update-profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await User.findByIdAndUpdate(userId, { password: hashedPassword, temporaryPassword: false });
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// Add email verification routes
router.use('/email-verification', emailVerification);

module.exports = router;
