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

  sourceList.forEach((source) => {
    const { type, name, url } = source;
    description += `**${type.toUpperCase()}**\n` + `Chaîne : ${name}\n` + `Url : ${url}`;
  });

  return description;
};

export { formatSourceToBlockQuote, formatSourceListToDescription };
