const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const { encrypt, decrypt } = require('../middleware/encryption');

router.post("/", voteController.recordVote);
router.get("/counts/:electionId", voteController.getVotesCountPerCandidate);
router.get('/hasVoted/:userId/:electionId', voteController.hasUserVoted);
router.get('/user/:userId', voteController.getUserVotes);
router.get('/test-encryption/:userId', (req, res) => {
    const { userId } = req.params;
  
    console.log(`Received request for userId: ${userId}`);
    
    try {
      const encryptedUserId = encrypt(userId.toString());
      console.log(`Encrypted userId: ${encryptedUserId}`);
      
      const decryptedUserId = decrypt(encryptedUserId);
      console.log(`Decrypted userId: ${decryptedUserId}`);
      
      res.status(200).json({
        originalUserId: userId,
        encryptedUserId: encryptedUserId,
        decryptedUserId: decryptedUserId,
      });
    } catch (error) {
      console.error('Error in test-encryption:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;
