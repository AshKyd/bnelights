const getMessages = require("./lib/getMessages");
const masto = require("masto");

async function post() {
  console.log(new Date(), "Fetching feed…");
  const messages = await getMessages({ targetSize: 500 });

  console.log("Logging in…");
  const bneSocial = await masto.login({
    url: "https://bne.social",
    accessToken: process.env.MASTODON_TOKEN,
  });

  const mastoPosts = messages.map((message) => {
    console.log("- Posting “" + message + "”");
    return bneSocial.statuses.create({
      status: message,
      visibility: "direct",
    });
  });

  await Promise.all(mastoPosts);
  console.log("Done.");
}

const cron = require("node-cron");

// cron.schedule("59 6 * * *", () => {
//   post();
// });

cron.schedule("40 13 * * *", async () => {
  console.log("13fired");
});

cron.schedule("40 23 * * *", async () => {
  console.log("23 fired");
});
