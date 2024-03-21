import { FSource } from "@/bdd/collections/source";
import { Publication } from "@/utils/types";
import FirestoreSource from "@/bdd/collections/source";
import FirestoreChannel from "@/bdd/collections/channel";
import logger from "@/utils/logger";
import Parser from "rss-parser";
import { Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import * as Sentry from "@sentry/node";
import { Client, ChannelType } from "discord.js";

const getRssPubs = async (sourceList: FSource[]): Promise<Publication[]> => {
    logger.info("Parsing RSS feeds");
    const publications: Publication[] = [];
    const parser = new Parser({
        customFields: {
            item: [
                ['itunes:image', 'imageTag'],
                ['media:content', 'imageTag']
            ],
        }
    });

    for (const source of sourceList) {
        const { id: sourceId, name, url, lastParsedAt } = source;
        if (!sourceId) continue;

        let feed;
        try {
            feed = await parser.parseURL(url);
        } catch (err) {
            logger.error(`Error parsing ${url}`);
            Sentry.captureException(err);
            continue;
        }

        const items = feed.items;
        let lastParsedAtShouldBeUpdated = false;

        items.sort((a, b) => {
            const aMs = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const bMs = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return aMs - bMs;
        });

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const { pubDate, title, link, contentSnippet, creator: author, imageTag } = item;
            if (!pubDate || !title || !link || !contentSnippet) continue;

            const pubDateMs = new Date(pubDate).getTime();
            if (!lastParsedAt || (new Date(lastParsedAt).getTime() < pubDateMs)) {
                lastParsedAtShouldBeUpdated = true;
                const duplicateIndex = publications.findIndex((p) => {
                    return p.title === title ||
                        p.contentSnippet === contentSnippet ||
                        p.link === link;
                    }
                );

                if (duplicateIndex >= 0) {
                    const duplicate = publications[duplicateIndex];
                    publications[duplicateIndex] = {
                        ...duplicate,
                        duplicateSources: [...(duplicate.duplicateSources || []), name],
                    };
                } else {
                    let imageUrl;
                    if (imageTag) {
                        imageUrl = imageTag.$.href || imageTag.$.url;
                    }

                    publications.push({
                        type: "rss",
                        name,
                        title,
                        link,
                        contentSnippet,
                        date: new Date(pubDate).toLocaleString("fr-FR"),
                        dateMs: pubDateMs,
                        imageUrl,
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

    publications.sort((a, b) => a.dateMs - b.dateMs);
    return publications;
}

const getFilteredPubsByChannel = async (publications: Publication[], sources: FSource[]) => {
    const pubsByChannels: { [channelId: string]: Publication[] } = {};
    const filtersByChannel: { [channelId: string]: string[]; } = {};

    for (const pub of publications) {
        const source = sources.find((s) => s.id === pub.sourceId);
        const channelIds = source?.channels || [];

        for (const channelId of channelIds) {
            if (!filtersByChannel[channelId]) {
                filtersByChannel[channelId] = await FirestoreChannel.getFilters(channelId);
            }

            const filters = filtersByChannel[channelId];
            const noFiltersDefined = filters.length === 0;
            const someFiltersMatch = filters.filter((f) => {
                const regex = new RegExp(`[\\s,;.\\-_'"]${f}[\\s,;.\\-_'"]`, "i");
                return regex.test(pub.title) || regex.test(pub.contentSnippet);
            });

            if (noFiltersDefined || someFiltersMatch.length > 0) {
                logger.info(`Nouvelle publication sur ${channelId}: ${pub.title}`)
                pubsByChannels[channelId] = pubsByChannels[channelId] || [];
                pubsByChannels[channelId].push( {
                    ...pub,
                    ...(someFiltersMatch.length > 0 ? { filters: someFiltersMatch } : {})
                })  ;
            }
        }
    }

    return pubsByChannels;
}

const publish = async (client: Client, pubsByChannel: { [channelId: string]: Publication[] }) => {
    const channelIds = Object.keys(pubsByChannel);
    for (const channelId of channelIds) {
      const testChannel = client.channels.cache.get(channelId);
      if (testChannel && testChannel.type === ChannelType.GuildText) {
        const pubs = pubsByChannel[channelId];
        for (const pub of pubs) {
          const messages = getMessage(Message.POST, pub);
          for (let i = 0; i < messages.length; i++) {
            await testChannel.send(messages[i]);
          }
        }
      }
    }
}

export { getRssPubs, getFilteredPubsByChannel, publish }