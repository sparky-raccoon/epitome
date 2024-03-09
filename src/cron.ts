import { Client, ChannelType } from "discord.js";
import { schedule } from "node-cron";
import Parser from "rss-parser";
import logger from "@/utils/logger";
import { Publication } from "@/utils/types";
import { Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import FirestoreSource, { FSource } from "@/bdd/collections/source";
import FirestoreChannel from "@/bdd/collections/channel";

const parseRssFeeds = async (sourceList: FSource[]): Promise<Publication[]> => {
  logger.info("Parsing RSS feeds");
  const publications: Publication[] = [];
  const parser = new Parser();

  for (const source of sourceList) {
    const { id: sourceId, name, url, lastParsedAt } = source;
    if (!sourceId) continue;

    const feed = await parser.parseURL(url);
    const items = feed.items;
    let lastParsedAtShouldBeUpdated = false;

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
      if (!lastParsedAt || (new Date(lastParsedAt).getTime() < pubDateMs)) {
        lastParsedAtShouldBeUpdated = true;

        const MAX_TITLE_LENGTH_IN_LOGS = 50;
        const slicedTitle =
          title.length >= MAX_TITLE_LENGTH_IN_LOGS
            ? title.slice(0, MAX_TITLE_LENGTH_IN_LOGS) + "..."
            : title;
        logger.info(`New publication : ${slicedTitle} (${pubDate})`);

        const duplicateIndex = publications.findIndex((p) => p.title === title);
        if (duplicateIndex >= 0) {
          const duplicate = publications[duplicateIndex];
          publications[duplicateIndex] = {
            ...duplicate,
            duplicateSources: [...(duplicate.duplicateSources || []), name],
          };
        } else {
          publications.push({
            type: "rss",
            name,
            title,
            link,
            contentSnippet,
            date: new Date(pubDate).toLocaleString("fr-FR"),
            dateMs: pubDateMs,
            sourceId,
            author,
          });
        }
      }
    }

    if (lastParsedAtShouldBeUpdated) {
      logger.info(`Updating source ${sourceId} lastParsedAt`);
      await FirestoreSource.updateLastParsedAt(sourceId);
    }
  }

  return publications;
}

const initCronJob = async (client: Client) => {
  logger.info("Initializing cron job");

  const checkAndPost = async () => {
    const sourceFullList = await FirestoreSource.getAll();
    const rssSources = sourceFullList.filter((s) => s.type === "rss");
    const publications: Publication[] = await parseRssFeeds(rssSources as FSource[]);
    publications.sort((a, b) => a.dateMs - b.dateMs);

    for (const pub of publications) {
      const { sourceId } = pub;
      const source = rssSources.find((s) => s.id === sourceId);

      for (const channelId of (source?.channels || [])) {
        const testChannel = client.channels.cache.get(channelId);
        if (testChannel && testChannel.type === ChannelType.GuildText) {
          const filters = await FirestoreChannel.getFilters(channelId);
          const noFiltersDefined = filters.length === 0;
          const someFiltersMatch = filters.some((f) => {
            const regex = new RegExp(f, "i");
            return regex.test(pub.title) || regex.test(pub.contentSnippet);
          });

          if (noFiltersDefined || someFiltersMatch) {
            testChannel.send(getMessage(Message.POST, pub));
          }
        }
      }
    }
  };

  checkAndPost();
  schedule("0 */4 * * *", () => checkAndPost());
};

export default initCronJob;
