const express = require('express');

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
const publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public.pem'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private.pem'), 'utf8');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: config.email.auth
});

// Function to encrypt data
const encrypt = (data) => {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

// Function to decrypt data
const decrypt = (encryptedData) => {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString('utf8');
};

exports.recordVote = async (req, res) => {
  const { userId, candidateRoleId } = req.body;

  try {
    const candidateRole = await Role.findById(candidateRoleId).populate('electionId');
    if (!candidateRole || candidateRole.role !== 'candidat') {
      return res.status(403).json({ message: "Invalid candidate role" });
    }

    const electionId = candidateRole.electionId;

    const candidateRoles = await Role.find({ electionId, role: 'candidat' }).select('_id');
    const roleIds = candidateRoles.map(role => role._id);
    const existingVote = await Vote.findOne({ userId, roleId: { $in: roleIds } });

    if (existingVote) {
      return res.status(400).json({ message: "User has already voted in this election" });
    }

    const encryptedRoleId = encrypt(candidateRoleId.toString());

    const newVote = new Vote({
      userId,
      roleId: encryptedRoleId,
    });

    await newVote.save();

    const user = await User.findById(userId);

    const mailOptions = {
      from: config.email.auth.user,
      to: user.email,
      subject: 'Vote Confirmation',
      text: `Dear ${user.firstName},\n\nThank you for casting your vote.\n\nBest regards,\nElection Committee`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json(newVote);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    const votes = await Vote.find({ roleId: { $in: roleIds } });

    const decryptedVotes = votes.map(vote => ({
      ...vote.toObject(),
      roleId: decrypt(vote.roleId)
    }));

    const voteCounts = decryptedVotes.reduce((acc, vote) => {
      acc[vote.roleId] = (acc[vote.roleId] || 0) + 1;
      return acc;
    }, {});

    const candidatesWithVotes = await Role.aggregate([
      { $match: { _id: { $in: Object.keys(voteCounts).map(id => mongoose.Types.ObjectId(id)) } } },
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
          totalVotes: {
            $let: {
              vars: { roleId: { $toString: "$_id" } },
              in: { $cond: { if: { $in: ["$$roleId", Object.keys(voteCounts)] }, then: voteCounts["$$roleId"], else: 0 } }
            }
          }
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

