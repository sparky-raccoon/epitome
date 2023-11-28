import { schedule } from "node-cron";
import Parser from "rss-parser";
import logger from "@/utils/logger";
import { listSources, replaceSourceList } from "@/utils/source";
import { Publication } from "@/types";
import { ChannelType, Client } from "discord.js";
import { Message, SourceType } from "@/constants";
import { getMessage } from "@/utils/messages";

const FILTER_KEYWORDS = ["féminisme", "féministe"];

const parseRssFeeds = async (): Promise<Publication[]> => {
  const sourceList = await listSources();
  const rssSources = sourceList.rss;
  const publications: Publication[] = [];
  let shouldTimestampsBeUpdated = false;

  if (rssSources) {
    const rssSourceNames = Object.keys(rssSources);
    if (rssSourceNames.length > 0) {
      const parser = new Parser();
      const promises = rssSourceNames.map(
        async (name) => await parser.parseURL(rssSources[name].url)
      );

      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        const rssSourceName = rssSourceNames[index];
        const rssSource = rssSources[rssSourceName];

        if (result.status === "fulfilled") {
          logger.info(`Successfully parsed RSS source ${rssSourceName}`);
          const feed = result.value;
          const items = feed.items;
          const lastParsedMs = parseInt(rssSource.timestamp);

          for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const { pubDate, title, link, contentSnippet, creator: author } = item;
            if (!pubDate || !title || !link || !contentSnippet) continue;

            if (
              !FILTER_KEYWORDS.some(
                (keyword) =>
                  title.toLowerCase().includes(keyword) ||
                  contentSnippet.toLowerCase().includes(keyword)
              )
            )
              continue;

            const pubDateMs = new Date(pubDate).getTime();
            if (lastParsedMs < pubDateMs) {
              shouldTimestampsBeUpdated = true;
              rssSource.timestamp = pubDateMs.toString();

              publications.push({
                type: SourceType.RSS,
                name: rssSourceName,
                title,
                link,
                contentSnippet,
                date: new Date(pubDateMs).toLocaleString("fr-FR"),
                author,
              });
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

  schedule("0 9-15/3 * * *", async () => {
    const testChannel = client.channels.cache.get("1173722193990000750");
    if (testChannel && testChannel.type === ChannelType.GuildText) {
      const publications = await parseRssFeeds();
      publications.forEach((publication) => {
        testChannel.send(getMessage(Message.POST, publication));
      });
    }
  });
};

export default initCronJob;
