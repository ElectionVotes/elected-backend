const express = require("express");
const router = express.Router();
const electionController = require("../controllers/electionController");
// WAITING FOR JWT AUTH FOR HANDLING AUTHORISATION FOR ADDING A NEW ELECTION BY ADMIN ONLY

router.post("/", electionController.createElection);
router.put("/:id", electionController.updateElection);
router.delete("/:id", electionController.deleteElection);
router.get("/", electionController.getAllElections);
router.get("/:id", electionController.getElectionById); 
router.get("/:id/candidates", electionController.getCandidatesByElectionId); 

module.exports = router;
