const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Vote || mongoose.model("Vote", voteSchema);
