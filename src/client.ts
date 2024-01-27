import { Client, Events, GatewayIntentBits } from "discord.js";
import { Command, Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import { Process } from "@/utils/process";
import logger from "@/utils/logger";
import { reply } from "@/utils/replier";
import initCronJob from "@/cron";
import {
  initDatabase,
  cleanDatabaseOnGuildLeave,
  cleanDatabaseOnChannelLeave,
  listEverything,
} from "@/bdd/operator";
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

    client.on(Events.GuildDelete, async (guild) => {
      logger.info(`Left guild: $${guild.id}`);
      await cleanDatabaseOnGuildLeave(guild.id);
    });

    client.on(Events.ChannelDelete, async (channel) => {
      logger.info(`Left channel: ${channel.id}`);
      await cleanDatabaseOnChannelLeave(channel.id);
    });

    const flows: { [userId: string]: Process } = {};
    const cleanup = (userId: string) => delete flows[userId];
    client.on(Events.InteractionCreate, async (interaction) => {
      const userId = interaction.user.id;
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === Command.HELP) {
          await reply(interaction, getMessage(Message.HELP));
        } else {
          if (!flows[userId]) {
            if (interaction.commandName !== Command.CANCEL) {
              flows[userId] = new Process(interaction, cleanup);
            } else {
              await reply(
                interaction,
                getMessage(Message.ERROR, "Tu n'as aucune procédure en cours.")
              );
            }
          } else {
            if (interaction.commandName !== Command.CANCEL) {
              await reply(
                interaction,
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
      } else if (interaction.isAutocomplete()) {
        const { channelId, options } = interaction;
        const query = options.getString("nom")?.toLocaleLowerCase();

        if (query && query.length > 0) {
          const sourceOrTagList = await listEverything(channelId);
          const suggestions = sourceOrTagList.filter(({ name }) => {
            const sourceOrTagName = name.toLocaleLowerCase();
            return sourceOrTagName.includes(query);
          });
          const choices = suggestions.map(({ name }) => ({ name, value: name })).slice(0, 25);
          await interaction.respond(choices);
        }
      }
    });
  });

  client.login(token);

  return { client, sequelize };
};

export default initDiscordClient;
