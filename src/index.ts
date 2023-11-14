import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { Command, Message } from "@/constants";
import { getMessage } from "@/utils/messages";
import { AddFlow, DeleteFlow, ListFlow } from "@/utils/flows";

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
  const userId = interaction.user.id;

  if (!flows[userId]) {
    if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case Command.ADD: {
          const url = interaction.options.getString("url", true);
          flows[userId] = new AddFlow({ userId, interaction, url, cleanup });
          break;
        }
        case Command.DELETE: {
          flows[userId] = new DeleteFlow({ userId, interaction, cleanup });
          break;
        }
        case Command.LIST: {
          flows[userId] = new ListFlow({ userId, interaction, cleanup });
          break;
        }
        case Command.HELP: {
          await interaction.reply(getMessage(Message.HELP));
          break;
        }
        case Command.CANCEL: {
          await interaction.reply(
            getMessage(
              Message.ERROR,
              "Il n'y a aucune procédure dont tu serais l'initiateur.ice à annuler."
            )
          );
          break;
        }
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
    } /* else if (interaction.isSelectMenu()) {
      const selectedItem = interaction.
    } */
  }
});

client.login(process.env.TOKEN);
