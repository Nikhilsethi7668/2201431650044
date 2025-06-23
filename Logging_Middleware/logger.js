function logEvent({
  component = "Unknown",
  level = "INFO",
  message = "",
  timestamp = new Date().toISOString(),
}) {
  const log = {
    timestamp,
    component,
    level,
    message,
  };

  console.log(JSON.stringify(log));
}

module.exports = { logEvent };
