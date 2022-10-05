import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const confirmOrCancelButton = (): ActionRowBuilder<ButtonBuilder> =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm-yes-button")
      .setLabel("Confirmer")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("confirm-no-button")
      .setLabel("Annuler")
      .setStyle(ButtonStyle.Secondary)
  );

export { confirmOrCancelButton };
