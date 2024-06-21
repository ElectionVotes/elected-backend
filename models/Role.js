const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
  role: { type: String, required: true, enum: ['candidat', 'electeur'] },
});

module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);
