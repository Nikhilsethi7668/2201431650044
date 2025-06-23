const express = require("express");
const {
  shortenUrl,
  redirectToUrl,
  getAll,
} = require("../Controllers/urlController");
const router = express.Router();

router.post("/shorturls", shortenUrl);
router.get("/:shortcode", redirectToUrl);
// router.get("/shorturls/:shortcode", getStats);
router.get("/all/shorturls", getAll);

module.exports = router;
