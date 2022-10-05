import { ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { SourceList, SourceTypes } from "../types";
import { formatSourceTypeToReadable } from "../utils/source";

const selectSavedSourcesMenu = (
  savedSourceList: SourceList
): ActionRowBuilder<SelectMenuBuilder> => {
  const options = [];
  const savedSourceTypes = Object.keys(savedSourceList) as Array<SourceTypes>;
  for (let i = 0; i < savedSourceTypes.length; i++) {
    const sourceType = savedSourceTypes[i];
    const savedSourceNamesInType = Object.keys(sourceType);
    for (let j = 0; j < savedSourceNamesInType.length; j++) {
      const sourceName = savedSourceNamesInType[i];
      options.push({
        label: `[${formatSourceTypeToReadable(sourceType)}] ${sourceName} (${
          savedSourceList[sourceType]?.[sourceName].url
        })`,
        value: `${sourceType}-${sourceName}`,
      });
    }
  }

  return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId("select-saved-source")
      .addOptions(options)
  );
};

export { selectSavedSourcesMenu };
