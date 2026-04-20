const { program } = require("commander");
const cron = require("node-cron");
const run = require("./lib/run");
const log = require("./lib/logger");

program
  .name("bnelights")
  .description("What colour are the lights today?")
  .version("1.0.0");

program
  .command("cron")
  .description("Run the bot on a schedule")
  .action(() => {
    log("Starting bot in cron mode (59 6 * * *)...");
    cron.schedule("59 6 * * *", () => {
      run();
    });
  });

program
  .command("dry-run")
  .description("Run the bot once without posting")
  .action(async () => {
    log("Running bot in dry-run mode...");
    await run({ dryRun: true });
  });

program.parse();
