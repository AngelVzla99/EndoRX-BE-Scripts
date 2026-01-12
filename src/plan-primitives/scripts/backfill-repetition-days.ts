import { MongoSingleton } from "../../clients/mongo.client.js";
import { LoggerClient } from "../../clients/logger.client.js";
import {
  PlanPrimitiveModel,
  calculateRepetitionDays,
} from "../../plan-primitives/plan-primitives.model.js";

type BackfillRepetitionDaysOptions = {
  manageConnection?: boolean;
};

type BackfillRepetitionDaysResult = {
  updatedCount: number;
  total: number;
};

async function backfillRepetitionDays(
  options: BackfillRepetitionDaysOptions = {},
): Promise<BackfillRepetitionDaysResult> {
  const { manageConnection = true } = options;
  const logger = new LoggerClient();
  const mongo = MongoSingleton.getInstance();

  if (manageConnection) {
    await mongo.getConnection();
  }

  const primitives = await PlanPrimitiveModel.find({});
  let updatedCount = 0;

  for (const primitive of primitives) {
    const computed = calculateRepetitionDays(primitive.frequencyPerWeek);

    if (primitive.repetitionDays !== computed) {
      primitive.repetitionDays = computed;
      await primitive.save();
      updatedCount += 1;
    }
  }

  logger.info("Plan primitives repetitionDays backfill completed", {
    updatedCount,
    total: primitives.length,
  });

  if (manageConnection) {
    await mongo.disconnect();
  }

  return {
    updatedCount,
    total: primitives.length,
  };
}

if (import.meta.main) {
  backfillRepetitionDays().catch(async (error) => {
    const logger = new LoggerClient();
    logger.error("Failed to backfill repetitionDays", {
      error: error instanceof Error ? error.message : String(error),
    });
    const mongo = MongoSingleton.getInstance();
    await mongo.disconnect();
    process.exit(1);
  });
}

export { backfillRepetitionDays };
