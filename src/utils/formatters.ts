import { blockQuote } from "discord.js";
import { FSource, isFSource } from "@/bdd/collections/source";

const formatSourceToBlockQuote = (source: FSource): `>>> ${string}` => {
  const { type, name, url } = source;

  return blockQuote(
    `Type : ${type?.toUpperCase() || "RSS"} \n` + `Chaîne : ${name}\n` + `Url : ${url}`
  );
};

const formatSourceListToBlockQuotes = (list: FSource[]): string => {
  let description = "";
  list.forEach((source) => {
    const { type, name, url } = source;
    description +=
      `Type : ${type?.toUpperCase() || "RSS"} \n` + `Chaîne : ${name}\n` + `Url : ${url}\n\n`;
  });

  return blockQuote(description);
};

const formatFullListToDescription = (list: (FSource | string)[]): string => {
  let description = "";
  type ByTypeSourceList = { [type: string]: { name: string; url: string }[] };

  const byTypeSourceList = list.reduce((acc: ByTypeSourceList, sourceOrTag) => {
    if (isFSource(sourceOrTag)) {
      const { type, name, url } = sourceOrTag;
      const formattedType = `Flux ${type?.toUpperCase() || "RSS"}`;
      if (!acc[formattedType]) acc[formattedType] = [];
      acc[formattedType].push({ name, url });
    } else if (typeof sourceOrTag === "string") {
      if (!acc["Filtres"]) acc["Filtres"] = [];
      acc["Filtres"].push({ name: sourceOrTag, url: "" });
    }

    return acc;
  }, {});

  Object.keys(byTypeSourceList).forEach((type) => {
    description += `**${type.toUpperCase()}**\n`;
    byTypeSourceList[type].forEach((source, i) => {
      const { name, url } = source;
      const isLast = i === byTypeSourceList[type].length - 1;
      description += url ? `- ${name} (${url})\n` : name + `${isLast ? "" : ", "}`;
    });
    description += "\n";
  });

  return description;
};

const formatTagListToString = (list: string[]): string => {
  let description = "";
  list.forEach((tag, i) => {
    const isLast = i === list.length - 1;
    description += `**${tag}**${isLast ? "" : ", "}`;
  });

  return description;
};

const splitDescriptionInMultipleMessages = (description: string): string[] => {
  const messages: string[] = [];
  const descriptionLines = description.split("\n");
  let currentMessage = "";

  descriptionLines.forEach((line) => {
    if (currentMessage.length + line.length > 2000) {
      messages.push(currentMessage);
      currentMessage = "";
    }
    currentMessage += line + "\n";
  });
  messages.push(currentMessage);

  return messages;
};

export {
  formatSourceToBlockQuote,
  formatSourceListToBlockQuotes,
  formatFullListToDescription,
  formatTagListToString,
  splitDescriptionInMultipleMessages,
};
