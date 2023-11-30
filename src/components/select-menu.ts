import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { SourceList } from "@/utils/types";
import { SourceType } from "@/utils/constants";

const selectSavedSourcesMenu = (
  savedSourceList: SourceList
): ActionRowBuilder<StringSelectMenuBuilder> => {
  const options = [];

  for (const sourceType in savedSourceList) {
    const savedSourcesByType = savedSourceList[sourceType as SourceType];
    for (const sourceId in savedSourcesByType) {
      const source = savedSourcesByType[sourceId];
      const { name, url } = source;
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(name)
          .setValue(`${sourceType}|${sourceId}`)
          .setDescription(url)
      );
    }
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("select-saved-source").addOptions(options)
  );
};

export { selectSavedSourcesMenu };
