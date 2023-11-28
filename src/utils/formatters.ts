import { blockQuote } from "discord.js";
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
    `Type : ${formatSourceTypeToReadable(type)}\n` + `Chaîne : ${name}\n` + `Url : ${url}`
  );
};

const formatSourceListToDescription = (list: SourceList): string => {
  const fields = Object.keys(list).reduce((acc: string, type) => {
    const typeName = formatSourceTypeToReadable(type as SourceType);
    const sourcesByType = list[type as SourceType];

    if (sourcesByType) {
      const sourceNameAndUrls = [];
      const sourceNames = Object.keys(sourcesByType);

      if (sourceNames.length > 0) {
        for (const sourceName of sourceNames) {
          const source = sourcesByType[sourceName];
          const { url: sourceUrl } = source;

          sourceNameAndUrls.push(`- ${sourceName} (${sourceUrl})`);
        }

        return acc + `**${typeName}**\n` + sourceNameAndUrls.join("\n") + "\n\n";
      } else return acc;
    } else return acc;
  }, "");

  console.log(fields);
  return fields;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatYouTubeChannelToSource = (channelData: any, url: string): Source => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTwitterUserFeedToSource = (twitterData: any, url: string): Source => {
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
  formatSourceListToDescription,
  formatYouTubeChannelToSource,
  formatTwitterUserFeedToSource,
};
