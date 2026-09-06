const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  experience: String,
  image: String,
});

module.exports = mongoose.model("Counselor", counselorSchema);