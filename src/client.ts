import { Client, Events, GatewayIntentBits } from "discord.js";
import { Command, Message } from "@/utils/constants";
import { getMessage } from "@/utils/messages";
import { Process } from "@/utils/process";
import logger from "@/utils/logger";
import { reply } from "@/utils/replier";
// import initCronJob from "@/cron";
import FirestoreSource from "@/bdd/collections/source";
import FirestoreChannel from "@/bdd/collections/channel";

const initDiscordClient = (
  clientId?: string,
  token?: string
): {
  client: Client;
} => {
  if (!token || !clientId) throw new Error("Missing environment variables");
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async () => {
    logger.info(`Logged in as ${client.user?.tag}`);

    // initCronJob(client);

    client.on(Events.GuildCreate, async (guild) => {
      logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    });

    client.on(Events.GuildDelete, async (guild) => {
      logger.info(`Left guild: $${guild.id}`);
    });

    client.on(Events.ChannelDelete, async (channel) => {
      logger.info(`Left channel: ${channel.id}`);
      await FirestoreSource.removeChannelFromList(channel.id);
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
          const sourceList = await FirestoreSource.findWithChannelId(channelId);
          const filterList = await FirestoreChannel.getFilters(channelId);
          const sourceOrTagList = [ ...sourceList.map((s) => s.name), ...filterList ]
          const suggestions = sourceOrTagList.filter(name => {
            return name.toLocaleLowerCase().includes(query);
          });
          const choices = suggestions.map((name) => ({ name, value: name })).slice(0, 25);
          await interaction.respond(choices);
        }
      }
    });
  });

  client.login(token);

  return { client };
};

export default initDiscordClient;
