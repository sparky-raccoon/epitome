import { Client, ChannelType } from "discord.js";
import { schedule } from "node-cron";
import Parser from "rss-parser";
import logger from "@/utils/logger";
import { Publication } from "@/utils/types";
import { Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import {
  listChannelIds,
  listChannelSources,
  listChannelTags,
  updateSourceTimestamp,
} from "@/bdd/operator";

const parseRssFeeds = async (channelId: string): Promise<Publication[]> => {
  logger.info("Parsing RSS feeds");
  const sourceList = await listChannelSources(channelId);
  const tagList = await listChannelTags(channelId);
  const rssSources = sourceList.filter((s) => s.type === "RSS");
  const publications: Publication[] = [];

  if (rssSources.length > 0) {
    const parser = new Parser();

    for (const source of rssSources) {
      const { id, type, name, url, timestamp } = source;
      const feed = await parser.parseURL(url);

      const items = feed.items;
      const lastParsedMs = parseInt(timestamp);
      let newTimestamp = lastParsedMs.toString();
      logger.info(`Last parsed timestamp for "${name}": ${lastParsedMs}`);
      logger.info("Tags: " + tagList.map((t) => t.name).join(", "));

      items.sort((a, b) => {
        const aMs = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const bMs = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return aMs - bMs;
      });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { pubDate, title, link, contentSnippet, creator: author } = item;
        if (!pubDate || !title || !link || !contentSnippet) continue;

        const pubDateMs = new Date(pubDate).getTime();
        if (lastParsedMs < pubDateMs) {
          newTimestamp = pubDateMs.toString();

          const MAX_TITLE_LENGTH_IN_LOGS = 50;
          const slicedTitle =
            title.length >= MAX_TITLE_LENGTH_IN_LOGS
              ? title.slice(0, MAX_TITLE_LENGTH_IN_LOGS) + "..."
              : title;
          logger.info(`New publication : ${slicedTitle} (${pubDateMs})`);

          const duplicateIndex = publications.findIndex((p) => p.title === title);
          if (duplicateIndex >= 0) {
            const duplicate = publications[duplicateIndex];
            publications[duplicateIndex] = {
              ...duplicate,
              duplicateSources: [...(duplicate.duplicateSources || []), name],
            };
          } else if (
            tagList.length === 0 ||
            tagList
              .map((t) => t.name.toLowerCase())
              .some((keyword) => {
                const sentenceHasKeyWord = (s: string) =>
                  s.toLowerCase().split(" ").includes(keyword);
                const titleHasKeyword = sentenceHasKeyWord(title);
                const contentHasKeyword = sentenceHasKeyWord(contentSnippet);

                return titleHasKeyword || contentHasKeyword;
              })
          ) {
            publications.push({
              type,
              name,
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

      if (newTimestamp !== lastParsedMs.toString()) {
        logger.info(`Updating source ${id} with timestamp ${newTimestamp}`);
        await updateSourceTimestamp(id, newTimestamp);
      }
    }
  }

  return publications;
};

const initCronJob = async (client: Client) => {
  logger.info("Initializing cron job");

  const checkAndPost = async () => {
    const channelIds = await listChannelIds();
    for (const id of channelIds) {
      logger.info(`Checking channel ${id}`);
      const testChannel = client.channels.cache.get(id);
      if (!testChannel || testChannel.type !== ChannelType.GuildText) continue;

      const publications = await parseRssFeeds(id);
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
