import {
  MessageActionRow,
  MessageSelectMenu,
  MessageSelectOptionData,
} from "discord.js";
import { SourceList, SourceTypes } from "../types";
import { formatSourceTypeToReadable } from "../utils/source";

const selectSourceTypeMenu = new MessageActionRow().addComponents(
  new MessageSelectMenu()
    .setCustomId("select-source-type")
    .setPlaceholder("Chaîne YouTube")
    .addOptions([
      {
        label: "Chaîne YouTube",
        value: "youtube",
      },
      {
        label: "Compte Twitter",
        value: "twitter",
      },
      {
        label: "Compte Instagram",
        value: "ig",
      },
      {
        label: "Flux RSS",
        value: "rss",
      },
    ])
);

const selectSavedSourceMenu = (sourceList: SourceList) => {
  const options: MessageSelectOptionData | MessageSelectOptionData[] = [];
  for (const sourceType in sourceList) {
    for (const sourceName in sourceList[sourceType as SourceTypes]) {
      const name = sourceName;
      const type = formatSourceTypeToReadable(sourceType as SourceTypes);

      options.push({
        label: `${type} | ${name}`,
        value: `${type}-${name}`,
      });
    }
  }

  return new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("select-saved-source")
      .addOptions(options)
  );
};

export { selectSourceTypeMenu, selectSavedSourceMenu };
