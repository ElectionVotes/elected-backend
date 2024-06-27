const Election = require("../models/Election");
const Role = require("../models/Role");

exports.createElection = async (req, res) => {
  try {
    const { DateStart, DateEnd, CategoryID, Title, Description, isActive } = req.body;

    const newElection = new Election({
      DateStart,
      DateEnd,
      CategoryID,
      Title,
      Description,
      isActive: isActive || true,
    });

    await newElection.save();

    res.status(201).json(newElection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const electionId = req.params.id;
    const { DateStart, DateEnd, CategoryID, Title, Description, isActive } = req.body;

    let election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.DateStart = DateStart;
    election.DateEnd = DateEnd;
    election.CategoryID = CategoryID;
    election.Title = Title;
    election.Description = Description;
    election.isActive = isActive; // Directly assign isActive from request body
    await election.save();

    res.status(200).json(election);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.deleteElection = async (req, res) => {
  try {
    const electionId = req.params.id;

    const deletedElection = await Election.findByIdAndDelete(electionId);
    if (!deletedElection) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find();

    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const electionId = req.params.id;
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCandidatesByElectionId = async (req, res) => {
  try {
    const electionId = req.params.id;
    const roles = await Role.find({ electionId, role: 'candidat' }).populate('userId');

    const candidates = roles.map(role => {
      const user = role.userId.toObject(); 
      user.roleId = role._id; 
      user.roles = [role._id]; 
      return user;
    });

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

