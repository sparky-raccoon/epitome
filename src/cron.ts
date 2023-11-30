import { schedule } from "node-cron";
import Parser from "rss-parser";
import logger from "@/utils/logger";
import { listSources, replaceSourceList } from "@/utils/source";
import { Publication } from "@/utils/types";
import { ChannelType, Client } from "discord.js";
import { Message, SourceType } from "@/utils/constants";
import { getMessage } from "@/utils/messages";

const FILTER_KEYWORDS = ["féminisme", "féministe", "féminicide", "femme"];

const parseRssFeeds = async (): Promise<Publication[]> => {
  logger.info("Parsing RSS feeds");
  const sourceList = await listSources();
  const rssSources = sourceList.rss;
  const publications: Publication[] = [];
  let shouldTimestampsBeUpdated = false;

  if (rssSources) {
    const rssSourceIds = Object.keys(rssSources);
    if (rssSourceIds.length > 0) {
      const parser = new Parser();
      const promises = rssSourceIds.map(async (id) => await parser.parseURL(rssSources[id].url));

      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        const rssSourceId = rssSourceIds[index];
        const rssSource = rssSources[rssSourceId];
        const rssSourceName = rssSource.name;

        if (result.status === "fulfilled") {
          logger.info(`Successfully parsed RSS source ${rssSourceName}`);
          const feed = result.value;
          const items = feed.items;
          const lastParsedMs = parseInt(rssSource.timestamp);

          for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const { pubDate, title, link, contentSnippet, creator: author } = item;
            if (!pubDate || !title || !link || !contentSnippet) continue;

            const pubDateMs = new Date(pubDate).getTime();
            if (lastParsedMs < pubDateMs) {
              if (!shouldTimestampsBeUpdated) shouldTimestampsBeUpdated = true;
              rssSource.timestamp = pubDateMs.toString();

              if (
                FILTER_KEYWORDS.some(
                  (keyword) =>
                    title.toLowerCase().includes(keyword) ||
                    contentSnippet.toLowerCase().includes(keyword)
                )
              ) {
                publications.push({
                  type: SourceType.RSS,
                  name: rssSourceName,
                  title,
                  link,
                  contentSnippet,
                  date: new Date(pubDateMs).toLocaleString("fr-FR"),
                  dateMs: pubDateMs,
                  author,
                });
              }
            }
          }
        } else logger.error(`Error while parsing RSS source ${rssSourceName}`);
      });
    }
  }

  if (shouldTimestampsBeUpdated) await replaceSourceList(sourceList);

  return publications;
};

const initCronJob = async (client: Client) => {
  logger.info("Initializing cron job");
  const checkAndPost = async () => {
    const testChannel = client.channels.cache.get("1173722193990000750");
    if (testChannel && testChannel.type === ChannelType.GuildText) {
      const publications = await parseRssFeeds();
      publications.sort((a, b) => a.dateMs - b.dateMs);
      publications.forEach((publication) => {
        testChannel.send(getMessage(Message.POST, publication));
      });
    }
  };

  checkAndPost();
  schedule("0 */4 * * *", () => checkAndPost());
};

export default initCronJob;
