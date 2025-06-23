const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  shortcode: String,
  referrer: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Click", clickSchema);
