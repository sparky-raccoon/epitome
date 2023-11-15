import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BUTTON_CANCEL_ID, BUTTON_CONFIRM_ID } from "@/constants";

const confirmOrCancelButton = (): ActionRowBuilder<ButtonBuilder> =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_CONFIRM_ID)
      .setLabel("Confirmer")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(BUTTON_CANCEL_ID)
      .setLabel("Annuler")
      .setStyle(ButtonStyle.Secondary)
  );

export { confirmOrCancelButton };
