import * as dotenv from "dotenv";
import initDiscordClient from "@/client";
import logger from "@/utils/logger";

dotenv.config();
const { NODE_ENV, TOKEN, TOKEN_DEV, CLIENT_ID, CLIENT_ID_DEV } = process.env;
const token = NODE_ENV === "development" ? TOKEN_DEV : TOKEN;
const clientId = NODE_ENV === "development" ? CLIENT_ID_DEV : CLIENT_ID;
const { client } = initDiscordClient(clientId, token);

const cleanup = () => {
  logger.info("Destroying Discord client");
  client.removeAllListeners();
  client.destroy();
};

const handleShutDown = () => {
  cleanup();
  process.exit(0);
};

type ErrorType = "uncaughtException" | "unhandledRejection";
const handleError = (type: ErrorType, err: Error) => {
  logger.error(`${type}: ${err.message}`);
  cleanup();
  process.exit(1);
};

process.on("SIGINT", handleShutDown);
process.on("SIGTERM", handleShutDown);
process.on("uncaughtException", (err: Error) => handleError("uncaughtException", err));
process.on("unhandledRejection", (err: Error) => handleError("unhandledRejection", err));
