import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

import { CommandTypes, MessageTypes } from "./types";
import { getMessage } from "./messages";
import { AddFlow, DeleteFlow, ListFlow } from "./flows";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

const flows: { [userId: string]: AddFlow | DeleteFlow | ListFlow } = {};
const cleanup = (userId: string) => delete flows[userId];
client.on("interactionCreate", async (interaction) => {
  const {
    user: { id: userId },
  } = interaction;

  if (!flows[userId]) {
    if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case CommandTypes.ADD: {
          const url = interaction.options.getString("url", true);
          flows[userId] = new AddFlow({ userId, interaction, url, cleanup });
          break;
        }
        case CommandTypes.DELETE:
          // TODO: check if source list isn't empty, if so reply with DELETE.
          // Otherwise send ERROR.
          flows[userId] = new DeleteFlow({ userId, interaction, cleanup });
          break;
        case CommandTypes.LIST:
          // TODO: check if source list isn't empty, if so reply with LIST.
          // Otherwise send ERROR.
          flows[userId] = new ListFlow({ userId, interaction, cleanup });
          break;
        case CommandTypes.HELP:
          await interaction.reply(getMessage(MessageTypes.HELP));
          break;
        case CommandTypes.CANCEL:
          await interaction.reply(
            getMessage(
              MessageTypes.ERROR,
              "Il n'y a aucune procédure dont vous êtes l'initiateur.ice à annuler."
            )
          );
          break;
      }
    }
  } else {
    if (interaction.isButton()) {
      const isConfirmButtonClicked =
        interaction.customId === "confirm-yes-button";
      flows[userId].update({
        type: isConfirmButtonClicked ? "confirmed" : "cancel",
        interaction,
      });
    }
  }
});

client.login(process.env.TOKEN);
