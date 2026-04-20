import { login } from "masto";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";
import parseXml from "./parseXml.js";
import getMessages from "./getMessages.js";
import log from "./logger.js";
import "dotenv/config";

const gzip = promisify(zlib.gzip);

async function fetchData() {
  const response = await fetch(
    "http://www.trumba.com/calendars/light-up-brisbane.rss"
  );
  const xml = await response.text();

  // Archive the raw XML (gzipped)
  const date = new Date().toISOString().split("T")[0];
  const archiveDir = path.resolve(import.meta.dirname, "..", "data", "archive");
  await fs.mkdir(archiveDir, { recursive: true });
  const compressed = await gzip(xml, { level: 9 });
  await fs.writeFile(path.join(archiveDir, `${date}.xml.gz`), compressed);

  return parseXml(xml);
}

export default async function run({ dryRun = false } = {}) {
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
      log(`- Would post: “${message}”`);
    });
    return;
  }

  log("Logging in…");
  const bneSocial = await login({
    url: "https://bne.social",
    accessToken: process.env.MASTODON_TOKEN,
  });

  const mastoPosts = messages.map((message) => {
    log(`- Posting “${message}”`);
    return bneSocial.statuses.create({
      status: message,
    });
  });

  await Promise.all(mastoPosts);
  log("Done.");
}
