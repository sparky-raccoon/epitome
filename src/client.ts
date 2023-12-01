import { Client, Events, GatewayIntentBits } from "discord.js";
import { Command, Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import { Process } from "@/utils/process";
import logger from "@/utils/logger";
import initCronJob from "@/cron";
import { initDatabase } from "@/bdd/operator";
import { Sequelize } from "sequelize";

const initDiscordClient = (
  clientId?: string,
  token?: string
): {
  client: Client;
  sequelize: Sequelize | null;
} => {
  if (!token || !clientId) throw new Error("Missing environment variables");
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  let sequelize = null;

  client.once(Events.ClientReady, async () => {
    logger.info(`Logged in as ${client.user?.tag}`);

    sequelize = await initDatabase();
    initCronJob(client);

    client.on(Events.GuildCreate, async (guild) => {
      logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    });

    const flows: { [userId: string]: Process } = {};
    const cleanup = (userId: string) => delete flows[userId];
    client.on(Events.InteractionCreate, async (interaction) => {
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
  });

  client.login(token);

  return { client, sequelize };
};

export default initDiscordClient;
