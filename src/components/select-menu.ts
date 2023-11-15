import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { SourceList } from "@/types";
import { formatSourceTypeToReadable } from "@/utils/formatters";
import { SourceType } from "@/constants";

const selectSavedSourcesMenu = (
  savedSourceList: SourceList
): ActionRowBuilder<StringSelectMenuBuilder> => {
  const options = [];

  for (const sourceType in savedSourceList) {
    for (const sourceName in savedSourceList[sourceType as SourceType]) {
      options.push({
        label: `[${formatSourceTypeToReadable(
          sourceType as SourceType
        )}] ${sourceName} (${
          savedSourceList[sourceType as SourceType]?.[sourceName]?.url
        })`,
        value: `${sourceType}-${sourceName}`,
      });
    }
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("select-saved-source")
      .addOptions(options)
  );
};

export { selectSavedSourcesMenu };
