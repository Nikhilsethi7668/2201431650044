const express = require("express");
const {
  shortenUrl,
  redirectToUrl,
  getStats,
} = require("../Controllers/urlController");
const router = express.Router();

router.post("/shorturls", shortenUrl);
router.get("/:shortcode", redirectToUrl);
router.get("/shorturls/:shortcode", getStats);

module.exports = router;
