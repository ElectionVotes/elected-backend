const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Ensure the path to your user model is correct

const router = express.Router();

// Function to generate a random string
function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// Configure nodemailer
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eelected41@gmail.com',
    pass: 'qljdwodhgxiiraoa'
  }
});

// Function to send emails
function sendEmail(to, verificationCode, votingId, votingPassword) {
  const mailOptions = {
    from: 'Système de vote <noreply@votre-serveur-de-vote.com>',
    to: to,
    subject: 'Votre code de vérification et vos identifiants de vote',
    text: `Bonjour,
Voici votre code de vérification: ${verificationCode}
Lien vers le serveur de vote : http://votre-serveur-de-vote.com
Voici votre identifiant : ${votingId}
Votre mot de passe : ${votingPassword}

Cordialement,
Votre équipe de vote.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email envoyé: ' + info.response);
    }
  });
}

// Endpoint to send verification email
router.post('/send-verification-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Received email for verification: ${email}`);
    const verificationCode = generateRandomString(6);
    const votingId = generateRandomString(8);
    const votingPassword = generateRandomString(12);

    // Save the verification code and voting credentials to the user
    const user = await User.findOneAndUpdate(
      { email },
      { verificationCode, votingId, votingPassword },
      { new: true, upsert: true }
    );

    console.log(`Generated verification code: ${verificationCode}`);
    console.log(`Generated voting ID: ${votingId}`);
    console.log(`Generated voting password: ${votingPassword}`);
    console.log(`Updated user with verification code and voting credentials: ${user}`);

    // Send the verification email
    sendEmail(email, verificationCode, votingId, votingPassword);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ message: 'Error sending verification email', error });
  }
});

// Endpoint to verify the code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    console.log(`Received email: ${email}, verification code: ${verificationCode}`);

    const user = await User.findOne({ email });

    console.log(`Retrieved user: ${user}`);
    console.log(`Stored verification code: ${user?.verificationCode}`);

    if (!user || user.verificationCode !== verificationCode) {
      console.log('Invalid verification code');
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Clear the verification code after successful verification
    user.verificationCode = undefined;
    await user.save();

    console.log('Verification successful');
    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ message: 'Error verifying code', error });
  }
});

module.exports = router;
