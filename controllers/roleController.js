const Role = require('../models/Role.js');
const User = require('../models/User.js');
const Election = require('../models/Election.js');

exports.createRole = async (req, res) => {
  try {
    const { userId, electionId, role } = req.body;

    if (!userId || !electionId || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newRole = new Role({ userId, electionId, role });
    await newRole.save();

    const user = await User.findById(userId);
    user.roles.push(newRole._id);
    await user.save();

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { role } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(roleId, { role }, { new: true });

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.status(200).json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const user = await User.findById(role.userId);
    user.roles.pull(roleId);
    await user.save();

    await role.remove();

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate('userId').populate('electionId');
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
