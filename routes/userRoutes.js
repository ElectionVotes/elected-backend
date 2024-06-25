const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const emailVerification = require('../middleware/emailVerification'); // Add this line
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require("../models/Role");
const Election = require("../models/Election");
const kcAdminClientPromise = require('../config/keycloak');

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


router.post('/key-register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const kcAdminClient = await kcAdminClientPromise;
    if (!kcAdminClient || !kcAdminClient.users || !kcAdminClient.users.create) {
      console.error('kcAdminClient is not properly initialized');
      throw new Error('kcAdminClient is not properly initialized');
    }

    console.log('Attempting to create user:', { firstName, lastName, email });

    const createdUser = await kcAdminClient.users.create({
      realm: 'Elected',
      username: email,
      email,
      firstName,
      lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: true,
        },
      ],
    });

    console.log('User created successfully:', createdUser);

    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

router.put('/key-update/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;
  try {
    const kcAdminClient = await kcAdminClientPromise;
    await kcAdminClient.users.update(
      { id },
      {
        firstName,
        lastName,
        email,
        enabled: true,
      }
    );
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Authenticate User
router.post('/key-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const kcAdminClient = await kcAdminClientPromise;
    const grant = await kcAdminClient.auth({
      username: email,
      password,
      grantType: 'password',
      clientId: 'react-client',
    });
    res.status(200).json({ token: grant.access_token });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Authentication failed', error });
  }
});

module.exports = router;
