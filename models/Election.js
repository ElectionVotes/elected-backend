const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const electionSchema = new Schema({
  DateStart: { type: Date, required: true },
  DateEnd: { type: Date, required: true },
  CategoryID: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.models.Election || mongoose.model("Election", electionSchema);
