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
      const sourceIds = Object.keys(sourcesByType);

      if (sourceIds.length > 0) {
        for (const sourceId of sourceIds) {
          const source = sourcesByType[sourceId];
          const { name, url } = source;

          sourceNameAndUrls.push(`- [${name}](${url})`);
        }

        return acc + `**${typeName}**\n` + sourceNameAndUrls.join("\n") + "\n\n";
      } else return acc;
    } else return acc;
  }, "");

  return fields;
};

export { formatSourceTypeToReadable, formatSourceToBlockQuote, formatSourceListToDescription };
