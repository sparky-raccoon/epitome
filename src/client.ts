import { Client, GatewayIntentBits } from "discord.js";
import { Command, Message } from "@/constants";
import { getMessage } from "@/utils/messages";
import { Process } from "@/utils/process";
import logger from "@/utils/logger";

const initDiscordClient = () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.on("ready", () => {
    logger.info(`Logged in as ${client.user?.tag}`);
  });

  const flows: { [userId: string]: Process } = {};
  const cleanup = (userId: string) => delete flows[userId];

  client.on("interactionCreate", async (interaction) => {
    const userId = interaction.user.id;
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === Command.HELP) {
        await interaction.reply(getMessage(Message.HELP));
      } else {
        if (!flows[userId]) {
          if (interaction.commandName !== Command.CANCEL) {
            flows[userId] = new Process(interaction, cleanup);
          } else {
            await interaction.reply(
              getMessage(
                Message.ERROR,
                "Il n'y a aucune procédure dont tu serais l'initiateur.ice à annuler."
              )
            );
          }
        } else {
          if (interaction.commandName !== Command.CANCEL) {
            await interaction.reply(
              getMessage(
                Message.ERROR,
                "Tu as déjà une procédure en cours. Tu peux l'annuler avec la commande `/cancel`."
              )
            );
          } else {
            flows[userId].cancel(interaction);
          }
        }
      }
    }
  });

  client.login(process.env.TOKEN);
};

export default initDiscordClient;
