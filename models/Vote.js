const mongoose = require("mongoose");
const crypto = require('crypto');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roleIdHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Vote || mongoose.model("Vote", voteSchema);
