import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { Source } from "@/bdd/models/source";
import { Tag } from "@/bdd/models/tag";
import { isSource } from "@/utils/types";

const selectSavedSourcesOrTagsMenu = (
  list: (Source | Tag)[]
): ActionRowBuilder<StringSelectMenuBuilder> => {
  const options = list.map((sourceOrTag) => {
    if (isSource(sourceOrTag)) {
      const { id, name, url } = sourceOrTag;
      return new StringSelectMenuOptionBuilder()
        .setLabel(name)
        .setValue(`${id}`)
        .setDescription(url);
    } else {
      const { id, name } = sourceOrTag;
      return new StringSelectMenuOptionBuilder().setLabel(name).setValue(`${id}`);
    }
  });

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("select-saved-source").addOptions(options)
  );
};

export { selectSavedSourcesOrTagsMenu };
