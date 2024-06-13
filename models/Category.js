const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true },
});

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema, "categories");
