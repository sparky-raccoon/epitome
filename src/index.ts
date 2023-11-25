import * as dotenv from "dotenv";
import initDiscordClient from "@/client";
import logger from "@/utils/logger";

dotenv.config();

const handleShutDown = () => {
  logger.info("\nGracefully shutting down from SIGINT (Ctrl-C) or SIGTERM");
  process.exit(0);
};

type ErrorType = "uncaughtException" | "unhandledRejection";
const handleError = (type: ErrorType, err: Error) => {
  logger.error(`${type}: ${err.message}`);
  process.exit(1);
};

process.on("SIGINT", handleShutDown);
process.on("SIGTERM", handleShutDown);
process.on("uncaughtException", (err: Error) => handleError("uncaughtException", err));
process.on("unhandledRejection", (err: Error) => handleError("unhandledRejection", err));

initDiscordClient();
