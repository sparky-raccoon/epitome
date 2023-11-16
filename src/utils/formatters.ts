import { APIEmbedField, blockQuote } from "discord.js";
import { SourceType } from "@/constants";
import { Source, SourceList } from "@/types";

const formatSourceTypeToReadable = (type: SourceType): string => {
  switch (type) {
    case SourceType.YOUTUBE:
      return "YouTube";
    case SourceType.INSTAGRAM:
      return "Instagram";
    case SourceType.TWITTER:
      return "Twitter";
    case SourceType.RSS:
      return "RSS";
  }
};

const formatSourceToBlockQuote = (source: Source): `>>> ${string}` => {
  const { type, name, url } = source;

  return blockQuote(
    `Type : ${formatSourceTypeToReadable(type)}\n` +
      `Chaîne : ${name}\n` +
      `Url : ${url}`
  );
};

const formatSourceListToEmbedField = (list: SourceList): APIEmbedField[] => {
  return Object.keys(list).reduce((acc: APIEmbedField[], type) => {
    const typeName = formatSourceTypeToReadable(type as SourceType);
    const sourcesByType = list[type as SourceType];

    if (sourcesByType) {
      const sourceNameAndUrls = [];
      const sourceNames = Object.keys(sourcesByType);

      if (sourceNames.length > 0) {
        for (const sourceName of sourceNames) {
          const source = sourcesByType[sourceName];
          const { url: sourceUrl } = source;

          sourceNameAndUrls.push(`${sourceName} (${sourceUrl})`);
        }

        return [
          ...acc,
          { name: typeName, value: sourceNameAndUrls.join("\n") },
        ];
      } else return acc;
    } else return acc;
  }, []);
};

const formatYouTubeChannelToSource = (
  channelData: any,
  url: string
): Source => {
  // FIXME: youtube channel data should be typed.
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { channelId: id, title: name } = channelData?.snippet;

  return {
    type: SourceType.YOUTUBE,
    name,
    url,
    feed: `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
  };
};

const formatTwitterUserFeedToSource = (
  twitterData: any,
  url: string
): Source => {
  // FIXME: youtube channel data should be typed.
  const { name } = twitterData;

  return {
    type: SourceType.TWITTER,
    name,
    url,
  };
};

export {
  formatSourceTypeToReadable,
  formatSourceToBlockQuote,
  formatSourceListToEmbedField,
  formatYouTubeChannelToSource,
  formatTwitterUserFeedToSource,
};
