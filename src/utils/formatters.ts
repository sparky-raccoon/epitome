import { blockQuote } from "discord.js";
import { Source, SourceCreation } from "@/bdd/models/source";
import { Tag } from "@/bdd/models/tag";
import { isSource, isTag } from "./types";

const formatSourceToBlockQuote = (source: Source | SourceCreation): `>>> ${string}` => {
  const { type, name, url } = source;

  return blockQuote(
    `Type : ${type?.toUpperCase() || "RSS"} \n` + `Chaîne : ${name}\n` + `Url : ${url}`
  );
};

const formatSourceListToDescription = (list: (Source | Tag)[]): string => {
  let description = "";
  type ByTypeSourceList = { [type: string]: { name: string; url: string }[] };

  const byTypeSourceList = list.reduce((acc: ByTypeSourceList, sourceOrTag) => {
    if (isSource(sourceOrTag)) {
      const { type, name, url } = sourceOrTag;
      const formattedType = `Flux ${type?.toUpperCase() || "RSS"}`;
      if (!acc[formattedType]) acc[formattedType] = [];
      acc[formattedType].push({ name, url });
    } else if (isTag(sourceOrTag)) {
      if (!acc["Filtres"]) acc["Filtres"] = [];
      acc["Filtres"].push({ name: sourceOrTag.name, url: "" });
    }

    return acc;
  }, {});

  Object.keys(byTypeSourceList).forEach((type) => {
    description += `**${type.toUpperCase()}**\n`;
    byTypeSourceList[type].forEach((source) => {
      const { name, url } = source;
      description += url ? `- ${name} (${url})\n` : `- ${name}\n`;
    });
  });

  return description;
};

export { formatSourceToBlockQuote, formatSourceListToDescription };
