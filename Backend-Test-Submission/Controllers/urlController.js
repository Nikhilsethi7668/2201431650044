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
  const minutes = validity || 30;
  const expiryDate = new Date(Date.now() + minutes * 60000);

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

    if (!urlData) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    if (urlData.expiry && new Date() > new Date(urlData.expiry)) {
      return res.status(410).json({ message: "URL expired" });
    }

    await Click.create({
      shortcode,
      timestamp: new Date(),
    });

    logEvent({
      component: "redirectToUrl",
      message: `Redirected to ${urlData.originalUrl} (click recorded)`,
      level: "INFO",
    });

    res.redirect(urlData.originalUrl);
  } catch (err) {
    logEvent({
      component: "redirectToUrl",
      message: `Redirection error: ${err.message}`,
      level: "ERROR",
    });
    res.status(500).json({ message: "Redirection failed" });
  }
};

const getAll = async (req, res) => {
  try {
    const allUrls = await Url.find({});
    const urlsWithClicks = [];

    for (const url of allUrls) {
      try {
        const clicks = await Click.find({ shortcode: url.shortcode }).sort({
          timestamp: -1,
        });
        urlsWithClicks.push({
          ...url.toObject(),
          clicks,
          totalClicks: clicks.length,
        });
      } catch (innerError) {
        console.error(
          `Error fetching clicks for shortcode ${url.shortcode}:`,
          innerError
        );
        urlsWithClicks.push({
          ...url.toObject(),
          clicks: [],
          totalClicks: 0,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: urlsWithClicks.length,
      data: urlsWithClicks,
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching URLs",
    });
  }
};

module.exports = { shortenUrl, redirectToUrl, getAll };
