const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const Election = require('../models/Election')
const xlsx = require('xlsx');

exports.importUsersFromExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    const electionId = req.body.electionId;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    for (const row of rows) {
      const { firstName, lastName, email, password, dateOfBirth, phoneNumber, role } = row;

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          firstName,
          lastName,
          email,
          password, // Assume the password is already hashed in the Excel file
          dateOfBirth,
          phoneNumber,
        });
        await user.save();
      }

      const userRole = new Role({
        userId: user._id,
        electionId: election._id,
        role,
      });
      await userRole.save();

      user.roles.push(userRole._id);
      await user.save();
    }

    res.status(200).json({ message: 'Users imported successfully' });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      phoneNumber,
      isAdmin,
      electionId,
      roleType,
    } = req.body;

    console.log('Request body:', req.body); // Log the request body for debugging

    // Validate the request body
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !phoneNumber || !electionId || !roleType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log('Email before saving:', email); // Log email before saving

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth,
      phoneNumber,
      isAdmin: isAdmin || false,
      roles: [],
    });

    await newUser.save();

    // Create a new role associated with the user and the election
    const newRole = new Role({
      userId: newUser._id,
      electionId: electionId,
      role: roleType,
    });

    await newRole.save();

    // Add the role to the user's roles array
    newUser.roles.push(newRole._id);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, password, dateOfBirth, phoneNumber, isAdmin, roles } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    // If password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    user.dateOfBirth = dateOfBirth;
    user.phoneNumber = phoneNumber;
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
    user.roles = roles !== undefined ? roles : user.roles;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
