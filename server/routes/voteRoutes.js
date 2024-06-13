const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");

router.post("/", voteController.recordVote);
router.get("/counts/:electionId", voteController.getVotesCountPerCandidate);
router.get('/hasVoted/:userId/:electionId', voteController.hasUserVoted);
router.get('/user/:userId', voteController.getUserVotes);

module.exports = router;
