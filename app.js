const getMessages = require("./lib/getMessages");
const masto = require("masto");
const cron = require("node-cron");

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

// a minute before 5 pm
cron.schedule("59 6 * * *", () => {
  post();
});
