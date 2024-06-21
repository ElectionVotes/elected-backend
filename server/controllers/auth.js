const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const isAuth = require('../middleware/isAuth');

require('dotenv').config();

const router = express.Router();

// Get the authenticated user's details
router.get('/me', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('roles');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log('Register request body:', req.body); // Log request body

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    // Create a new user with the role
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles: [], // Assign the role to the user
    });

    console.log('New user to be saved:', newUser);

    await newUser.save();
    console.log('User saved successfully');

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('roles');
    if (!user) {
      console.log('Invalid email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User found:', user);
    console.log('Password from request:', password);
    console.log('User password from database:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isAdmin = user.isAdmin;
    const payload = { userId: user._id, isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.status(200).json({ refresh_token: token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
