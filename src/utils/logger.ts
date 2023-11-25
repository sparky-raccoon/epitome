import { createLogger, format, transports } from "winston";
const { combine, timestamp, json } = format;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const winstonLogger = createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new transports.File({
      filename: "info-logs.log",
      level: "info",
    }),
    new transports.File({
      filename: "error-logs.log",
      level: "error",
    }),
  ],
});

const logger = IS_PRODUCTION ? winstonLogger : console;

export default logger;
