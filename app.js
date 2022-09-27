const parseXml = require("./lib/parseXml");
const getMessages = require("./lib/getMessages");
const masto = require("masto");
const cron = require("node-cron");

async function fetchData() {
  return fetch("http://www.trumba.com/calendars/light-up-brisbane.rss")
    .then((res) => res.text())
    .then(parseXml);

  // const XMLData = require("fs").readFileSync(
  //   "./test/assets/feed-the-queen.rss",
  //   "utf8"
  // );
}

async function post() {
  console.log(new Date(), "Fetching feed…");
  const items = await fetchData();
  const messages = await getMessages({ items, targetSize: 500 });

  console.log("Logging in…");
  const bneSocial = await masto.login({
    url: "https://bne.social",
    accessToken: process.env.MASTODON_TOKEN,
  });

  const mastoPosts = messages.map((message) => {
    console.log("- Posting “" + message + "”");
    return bneSocial.statuses.create({
      status: message,
      visibility: "unlisted",
    });
  });

  await Promise.all(mastoPosts);
  console.log("Done.");
}

// a minute before 5 pm AEST, expressed in UTC
cron.schedule("59 6 * * *", () => {
  post();
});
