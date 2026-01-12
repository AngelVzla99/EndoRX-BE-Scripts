import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { MongoSingleton } from "./clients/mongo.client.js";
import { LoggerClient } from "./clients/logger.client.js";
import { backfillRepetitionDays } from "./plan-primitives/scripts/backfill-repetition-days.js";
import { ScriptRunnerService } from "./script_runner/script_runner.service.js";

type ScriptRunnerAction =
  | "test-extractor"
  | "test-plan-quality"
  | "generate-primitives"
  | "response-time-stats";

const logger = new LoggerClient();
const mongo = MongoSingleton.getInstance();
const scriptRunnerService = new ScriptRunnerService();
const scriptRunnerActions: ScriptRunnerAction[] = [
  "test-extractor",
  "test-plan-quality",
  "generate-primitives",
  "response-time-stats",
];

// DO NOT REMOVE THIS LINE
await mongo.getConnection();

async function runScriptRunner(action: ScriptRunnerAction): Promise<void> {
  switch (action) {
    case "test-extractor":
      await scriptRunnerService.testExtractor();
      break;
    case "test-plan-quality":
      await scriptRunnerService.testPlanQuality();
      break;
    case "generate-primitives":
      await scriptRunnerService.generatePrimitives();
      break;
    case "response-time-stats":
      await scriptRunnerService.responseTimeStatistics();
      break;
    default:
      logger.error("Unsupported ScriptRunnerService action", { action });
  }
}

async function runBackfillRepetitionDays(): Promise<void> {
  const result = await backfillRepetitionDays({ manageConnection: false });
  logger.info("Backfill repetitionDays finished", result);
}

async function main(): Promise<void> {
  await yargs(hideBin(process.argv))
    .scriptName("scripts")
    .usage("Usage: yarn ts-node src/index.ts <command> [options]")
    .command(
      "backfill-repetition-days",
      "Backfill repetitionDays for plan primitives",
      (cmd) =>
        cmd.example(
          "$0 backfill-repetition-days",
          "Recompute repetitionDays for all plan primitives",
        ),
      async () => {
        await runBackfillRepetitionDays();
      },
    )
    .command<{ action: ScriptRunnerAction }>(
      "script-runner <action>",
      "Run ScriptRunnerService tasks",
      (cmd) =>
        cmd
          .positional("action", {
            describe: "ScriptRunnerService action to execute",
            choices: scriptRunnerActions,
            type: "string",
          })
          .example(
            "$0 script-runner test-extractor",
            "Run the extractor test harness",
          )
          .example(
            "$0 script-runner response-time-stats",
            "Measure /chat-message response time statistics",
          ),
      async ({ action }) => {
        await runScriptRunner(action);
      },
    )
    .demandCommand(1, "Please specify a command to run.")
    .strict()
    .help("help")
    .alias("help", "h")
    .alias("version", "v")
    .recommendCommands()
    .parseAsync();
}

try {
  await main();
  logger.info("Script completed successfully");
} catch (error) {
  logger.error("Script failed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}

// do not remove this line
await mongo.disconnect();
