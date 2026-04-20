const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("node:path");
const EventEmitter = require("node:events");

// Log rotation setup
const logStream = rfs.createStream("app.log", {
  interval: "30d",
  path: path.resolve(__dirname, "..", "data"),
});

// Combined stream for STDOUT and file
const combinedStream = {
  write: (message) => {
    process.stdout.write(message);
    logStream.write(message);
  },
};

// Custom morgan token for bot messages
morgan.token("message", (req) => req.message || "");
const botLogger = morgan(":date[iso] :message", { stream: combinedStream });

/**
 * Custom logger that uses morgan formatting and writes to both STDOUT and data/app.log
 * @param {string} message The message to log
 */
function log(message) {
  const req = { message };
  const res = new EventEmitter();
  // Morgan triggers logging on the 'finish' event of the response
  botLogger(req, res, () => {
    res.emit("finish");
  });
}

module.exports = log;
