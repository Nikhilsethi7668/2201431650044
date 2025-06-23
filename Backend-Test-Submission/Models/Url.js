const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    shortcode: { type: String, unique: true, required: true },
    expiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", urlSchema);
