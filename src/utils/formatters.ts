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
  return Object.keys(list).reduce((acc: APIEmbedField[], key: string) => {
    const name = formatSourceTypeToReadable(key as SourceType);
    const sourcesByType = list[key as SourceType];
    const sourceNamesByType = Object.keys(sourcesByType || {});
    if (sourceNamesByType.length > 0)
      return [...acc, { name, value: sourceNamesByType.join("\n") }];
    else return acc;
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
