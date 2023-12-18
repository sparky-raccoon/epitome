import { blockQuote } from "discord.js";
import { Source, SourceCreation } from "@/bdd/models/source";

const formatSourceToBlockQuote = (source: Source | SourceCreation): `>>> ${string}` => {
  const { type, name, url } = source;

  return blockQuote(
    `Type : ${type?.toUpperCase() || "RSS"} \n` + `Chaîne : ${name}\n` + `Url : ${url}`
  );
};

const formatSourceListToDescription = (sourceList: Source[]): string => {
  let description = "";
  type ByTypeSourceList = { [type: string]: { name: string; url: string }[] };

  const byTypeSourceList = sourceList.reduce((acc: ByTypeSourceList, source) => {
    const { type } = source;
    if (!acc[type]) acc[type] = [];
    acc[type].push({ name: source.name, url: source.url });

    return acc;
  }, {});

  Object.keys(byTypeSourceList).forEach((type) => {
    description += `**${type.toUpperCase()}**\n`;
    byTypeSourceList[type].forEach((source) => {
      const { name, url } = source;
      description += `- ${name} (${url})\n`;
    });
  });

  return description;
};

export { formatSourceToBlockQuote, formatSourceListToDescription };
