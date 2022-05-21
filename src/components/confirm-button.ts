import { MessageActionRow, MessageButton } from "discord.js";

const confirmButton = (primaryText = "Oui", secondaryText = "Non") =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("confirm-yes-button")
      .setLabel(primaryText)
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("confirm-no-button")
      .setLabel(secondaryText)
      .setStyle("SECONDARY"),
  ]);

export { confirmButton };
