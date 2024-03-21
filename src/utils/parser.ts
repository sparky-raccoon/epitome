import Parser from "rss-parser";
import * as Sentry from "@sentry/node";
import logger from "@/utils/logger";

const URL_REGEX =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRssInfoFromUrl = async (url: string): Promise<any> => {
  if (!URL_REGEX.test(url)) return;
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (err) {
    logger.error(`Error parsing ${url}`);
    Sentry.captureException(err);
    return null;
  }
};

export { getRssInfoFromUrl };
