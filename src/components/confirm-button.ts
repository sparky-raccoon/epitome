import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BUTTON_CANCEL_ID, BUTTON_CONFIRM_ID } from "@/utils/constants";

const confirmOrCancelButton = (yesLabel = "Confirmer", noLabel = "Annuler"): ActionRowBuilder<ButtonBuilder> =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_CONFIRM_ID)
      .setLabel(yesLabel)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(BUTTON_CANCEL_ID)
      .setLabel(noLabel)
      .setStyle(ButtonStyle.Secondary)
  );

export { confirmOrCancelButton };
