require("dotenv").config();
const parseXml = require("./parseXml");
const getMessages = require("./getMessages");
const masto = require("masto");
const log = require("./logger");
const fs = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");
const { promisify } = require("node:util");
const gzip = promisify(zlib.gzip);

async function fetchData() {
  const response = await fetch(
    "http://www.trumba.com/calendars/light-up-brisbane.rss",
  );
  const xml = await response.text();

  // Archive the raw XML (gzipped)
  const date = new Date().toISOString().split("T")[0];
  const archiveDir = path.resolve(__dirname, "..", "data", "archive");
  await fs.mkdir(archiveDir, { recursive: true });
  const compressed = await gzip(xml, { level: 9 });
  await fs.writeFile(path.join(archiveDir, `${date}.xml.gz`), compressed);

  const items = parseXml(xml);
  return items;
  // const XMLData = require("fs").readFileSync(
  //   "./test/assets/feed-the-queen.rss",
  //   "utf8"
  // );
}

module.exports = async function run({ dryRun = false } = {}) {
  log("Fetching feed…");
  const items = await fetchData();
  const messages = await getMessages({ items, targetSize: 500 });

  if (messages.length === 0) {
    log("No messages to post.");
    return;
  }

  if (dryRun) {
    log(`Dry run: skipping login and ${messages.length} post(s).`);
    messages.forEach((message) => {
      log("- Would post: “" + message + "”");
    });
    return;
  }

  log("Logging in…");
  const bneSocial = await masto.login({
    url: "https://bne.social",
    accessToken: process.env.MASTODON_TOKEN,
  });

  const mastoPosts = messages.map((message) => {
    log("- Posting “" + message + "”");
    return bneSocial.statuses.create({
      status: message,

      // We're not using hashtags or otherwise being obnoxious so this should be ok.
      // visibility: "unlisted",
    });
  });

  await Promise.all(mastoPosts);
  log("Done.");
};
