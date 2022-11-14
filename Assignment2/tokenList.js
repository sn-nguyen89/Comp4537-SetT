const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  blocked: {
    type: Boolean,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("tokenList", schema); //List of tokens
