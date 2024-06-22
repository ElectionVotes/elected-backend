const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Vote = require('../models/Vote');
const Role = require('../models/Role');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const config = require('../middleware/config');

// Load public and private keys
const publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public_key.pem'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private_key.pem'), 'utf8');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: config.email.auth
});

const encrypt = (data) => {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

const decrypt = (encryptedData) => {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

exports.recordVote = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'UserId and RoleId are required' });
    }

    const existingVote = await Vote.findOne({ userId });
    if (existingVote) {
      return res.status(400).json({ message: 'User has already voted' });
    }

    const encryptedRoleId = encrypt(roleId); // Use your encryption function

    const vote = new Vote({
      userId,
      roleId: encryptedRoleId,
    });

    await vote.save();
    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Error casting vote:', error.message); // Log the specific error message
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.getVotesCountPerCandidate = async (req, res) => {
  const { electionId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return res.status(400).json({ message: "Invalid electionId" });
    }

    const roles = await Role.find({ electionId, role: "candidat" }).select('_id userId');
    const roleIds = roles.map(role => role._id);

    const votesCount = await Vote.aggregate([
      { $match: { roleId: { $in: roleIds } } },
      { $group: { _id: "$roleId", totalVotes: { $sum: 1 } } },
    ]);

    const candidatesWithVotes = await Role.aggregate([
      { $match: { _id: { $in: votesCount.map((vote) => vote._id) } } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "candidateInfo",
        },
      },
      { $unwind: "$candidateInfo" },
      {
        $addFields: {
          candidateName: {
            $concat: [
              "$candidateInfo.firstName",
              " ",
              "$candidateInfo.lastName",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "roleId",
          as: "voteInfo",
        },
      },
      {
        $addFields: {
          totalVotes: { $size: "$voteInfo" },
        },
      },
      { $project: { _id: 1, candidateName: 1, totalVotes: 1 } },
    ]);

    res.status(200).json(candidatesWithVotes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hasUserVoted = async (req, res) => {
  const { userId, electionId } = req.params;

  try {
    const candidateRoles = await Role.find({ electionId, role: 'candidat' }).select('_id');
    const roleIds = candidateRoles.map(role => role._id);

    const vote = await Vote.findOne({ userId, roleId: { $in: roleIds } });

    if (vote) {
      return res.status(200).json({ hasVoted: true });
    } else {
      return res.status(200).json({ hasVoted: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserVotes = async (req, res) => {
  const { userId } = req.params;

  try {
    const votes = await Vote.find({ userId }).populate({
      path: 'roleId',
      populate: [
        {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName'
        },
        {
          path: 'electionId',
          model: 'Election',
          select: 'Title'
        }
      ]
    });

    const decryptedVotes = votes.map(vote => ({
      ...vote.toObject(),
      roleId: decrypt(vote.roleId)
    }));

    res.status(200).json(decryptedVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
