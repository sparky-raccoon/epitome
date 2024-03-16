import * as dotenv from "dotenv";
import initDiscordClient from "@/client";
import logger from "@/utils/logger";
import * as Sentry from "@sentry/node";

dotenv.config();
const { NODE_ENV, TOKEN, TOKEN_DEV, CLIENT_ID, CLIENT_ID_DEV } = process.env;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: NODE_ENV,
  tracesSampleRate: 1.0,
});

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
const handleError = async (type: ErrorType, err: Error) => {
  console.log('Handling error')
  Sentry.captureException(err);
  logger.error(`${type}: ${err.message}`);
  cleanup();

  await Sentry.close();
  process.exit(1);
};

process.on("SIGINT", handleShutDown);
process.on("SIGTERM", handleShutDown);
process.on("uncaughtException", (err: Error) => handleError("uncaughtException", err));
process.on("unhandledRejection", (err: Error) => handleError("unhandledRejection", err));
