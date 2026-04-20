#!/usr/bin/env node

import { program } from "commander";
import cron from "node-cron";
import run from "./lib/run.js";
import log from "./lib/logger.js";

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
      run().catch((err) => log(`Error in cron task: ${err.message}`));
    });
  });

program
  .command("dry-run")
  .description("Run the bot once without posting")
  .action(async () => {
    log("Running bot in dry-run mode...");
    try {
      await run({ dryRun: true });
    } catch (err) {
      log(`Error in dry-run: ${err.message}`);
    }
  });

program.parse();
