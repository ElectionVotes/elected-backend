const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  userId: { type: String, required: true }, 
  roleId: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Vote || mongoose.model("Vote", voteSchema);
