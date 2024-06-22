const { encryptVote } = require('../middleware/encryption');
const { decryptVote } = require('../middleware/encryption');
const Vote = require('../models/Vote');
const Role = require('../models/Role');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const config = require('../middleware/config');

const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: config.email.auth
});

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

    const encryptedRoleId = encryptVote(candidateRoleId.toString());  // Encrypt the roleId

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

    const decryptedVotes = await Promise.all(votes.map(async vote => {
      const decryptedRoleId = decryptVote(vote.roleId);  // Decrypt the roleId
      const role = await Role.findById(decryptedRoleId).populate('userId electionId');

      return {
        _id: vote._id,
        userId: vote.userId,
        roleId: role,
        createdAt: vote.createdAt
      };
    }));

    res.status(200).json(decryptedVotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
