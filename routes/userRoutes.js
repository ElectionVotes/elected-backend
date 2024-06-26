const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const emailVerification = require('../middleware/emailVerification'); // Add this line
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require("../models/Role");
const initKeycloak = require('../config/keycloak');

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
    const kcAdminClient = await initKeycloak();
    if (!kcAdminClient || !kcAdminClient.users || !kcAdminClient.users.create) {
      console.error('kcAdminClient is not properly initialized');
      throw new Error('kcAdminClient is not properly initialized');
    }

    console.log('Attempting to create user with password:', password);

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
          temporary: false,
        },
      ],
      attributes: {
        'givenName': firstName,
        'sn': lastName,
        'mail': email,
        'telephoneNumber': '+123456789'
      },
      requiredActions: [],
      groups: [],
      realmRoles: [],
      clientRoles: {}
    });

    console.log('User created successfully:', createdUser);

    // Immediately update the password using Keycloak Admin Client to ensure it propagates to LDAP
    await kcAdminClient.users.resetPassword({
      id: createdUser.id,
      credential: {
        type: 'password',
        value: password,
        temporary: false,
      },
    });

    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});



router.post('/key-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await fetch('http://localhost:8080/realms/Elected/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'react-client',
        client_secret: 'fKMsHPTfolY6FqVEGdhCfWi5qGsly9gh',  // Replace with your actual client secret
        grant_type: 'password',
        username: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error: ${response.statusText}`, errorData);
      if (errorData.error === 'invalid_grant' && errorData.error_description.includes('Account is not fully set up')) {
        // Handle required actions
        res.status(400).json({ message: 'Account requires additional setup.', requiredActions: errorData.error_description });
      } else {
        throw new Error(`Error: ${response.statusText}`);
      }
    } else {
      const data = await response.json();
      res.status(200).json({ token: data.access_token });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});


router.post('/update-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const kcAdminClient = await initKeycloak();
    await kcAdminClient.users.resetPassword({
      id: userId,
      credential: {
        type: 'password',
        value: newPassword,
        temporary: false,
      },
    });
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password', error });
  }
});

// Update User
router.put('/key-update/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;
  try {
    const kcAdminClient = await initKeycloak();
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



module.exports = router;
