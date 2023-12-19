import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { Source } from "@/bdd/models/source";

const selectSavedSourcesMenu = (
  savedSourceList: Source[]
): ActionRowBuilder<StringSelectMenuBuilder> => {
  const options = savedSourceList.map((source) => {
    const { id, name, url } = source;
    return new StringSelectMenuOptionBuilder().setLabel(name).setValue(`${id}`).setDescription(url);
  });

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder().setCustomId("select-saved-source").addOptions(options)
  );
};

export { selectSavedSourcesMenu };
