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

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const { pubDate, title, link, contentSnippet, creator: author } = item;
        if (!pubDate || !title || !link || !contentSnippet) continue;

        const pubDateMs = new Date(pubDate).getTime();
        if (lastParsedMs < pubDateMs) {
          await updateSourceTimestamp(id, pubDateMs.toString());

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
              .map((t) => t.name)
              .some(
                (keyword) =>
                  title.toLowerCase().includes(keyword) ||
                  contentSnippet.toLowerCase().includes(keyword)
              )
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
