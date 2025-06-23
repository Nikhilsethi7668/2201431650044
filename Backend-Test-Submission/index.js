const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const urlRoutes = require("./Routes/urlRoutes");
const { logEvent } = require("../Logging_Middleware/logger");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logEvent({
    component: "ExpressMiddleware",
    message: `Incoming ${req.method} request to ${req.url}`,
    level: "INFO",
  });
  next();
});

app.use("/api", urlRoutes);

app.use((err, req, res, next) => {
  logEvent({
    component: "ExpressErrorHandler",
    message: err.message,
    level: "ERROR",
    stack: err.stack,
  });
  res.status(500).json({ error: err.message });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logEvent({
      component: "MongoDB",
      message: "Connected to MongoDB",
      level: "SUCCESS",
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      logEvent({
        component: "ExpressApp",
        message: `Server started on port ${PORT}`,
        level: "INFO",
      });
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logEvent({
      component: "MongoDB",
      message: `MongoDB connection error: ${err.message}`,
      level: "ERROR",
    });
    process.exit(1);
  }
};

startServer();
