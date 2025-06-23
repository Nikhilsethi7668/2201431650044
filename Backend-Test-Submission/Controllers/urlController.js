const Url = require("../Models/Url");
const Click = require("../Models/Click");
const geoip = require("geoip-lite");
const { logEvent } = require("../../Logging_Middleware/logger");

const shortenUrl = async (req, res) => {
  const { url, validity, shortcode } = req.body;
  console.log("Request body:", req.body);

  if (!url)
    return res.status(400).json({ message: "Original URL is required" });

  const code = shortcode || Math.random().toString(36).substr(2, 6);
  const expiryDate = validity ? new Date(Date.now() + validity * 60000) : null;

  try {
    const newUrl = await Url.create({
      originalUrl: url,
      shortcode: code,
      expiry: expiryDate,
    });
    logEvent({
      component: "shortenUrl",
      message: `Created short URL ${code}`,
      level: "SUCCESS",
    });
    res.status(201).json({
      shortLink: `${process.env.BASE_URL}/${code}`,
      expiry: expiryDate,
    });
  } catch (err) {
    logEvent({
      component: "shortenUrl",
      message: `Error: ${err.message}`,
      level: "ERROR",
    });
    res.status(500).json({ message: "Error shortening URL" });
  }
};
const redirectToUrl = async (req, res) => {
  const { shortcode } = req.params;

  try {
    const urlData = await Url.findOne({ shortcode });

    if (!urlData)
      return res.status(404).json({ message: "Short URL not found" });

    if (urlData.expiry && new Date() > new Date(urlData.expiry)) {
      return res.status(410).json({ message: "URL expired" });
    }

    logEvent({
      component: "redirectToUrl",
      message: `Redirecting to ${urlData.originalUrl}`,
      level: "INFO",
    });

    res.redirect(urlData.originalUrl);
  } catch (err) {
    res.status(500).json({ message: "Redirection failed" });
  }
};

const getStats = async (req, res) => {
  const { shortcode } = req.params;

  try {
    const clicks = await Click.find({ shortcode }).sort({ timestamp: -1 });
    const urlData = await Url.findOne({ shortcode });

    if (!urlData)
      return res.status(404).json({ message: "Short URL not found" });

    res.json({
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiry: urlData.expiry,
      totalClicks: clicks.length,
      clicks,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};
module.exports = { shortenUrl, redirectToUrl, getStats };
