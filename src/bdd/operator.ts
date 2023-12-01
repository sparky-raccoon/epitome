import { Sequelize } from "sequelize";
import sequelize from "@/bdd/sequelize";

const Models = sequelize.models;

const initDatabase = async (): Promise<Sequelize> => {
  await sequelize.authenticate();
  sequelize.sync();

  return sequelize;
};

const addSource = async (
  guildId: string,
  channelId: string,
  source: { id: string; name: string; type: string }
): Promise<void> => {
  const guild = await Models.Guild.findByPk(guildId);
  if (!guild) await Models.Guild.create({ id: guildId });

  const channel = await Models.Channel.findByPk(channelId);
  if (!channel) await Models.Channel.create({ id: channelId, guildId });

  await Models.ChannelSource.create({ channelId, sourceId: source.id });
  await Models.Source.create({ ...source });
};

const deleteSource = async (
  guildId: string,
  channelId: string,
  sourceId: string
): Promise<void> => {
  const channelSource = await Models.ChannelSource.destroy({ where: { channelId, sourceId } });
  if (!channelSource) throw new Error("Cette source de publications n'existe pas, ou plus.");

  const remainingS = await Models.ChannelSource.findAll({ where: { sourceId } });
  const remainingC = await Models.ChannelSource.findAll({ where: { channelId } });
  if (remainingS.length === 0) await Models.Source.destroy({ where: { id: sourceId } });
  if (remainingC.length === 0) await Models.Channel.destroy({ where: { id: channelId } });

  const remainingG = await Models.Channel.findAll({ where: { guildId } });
  if (remainingG.length === 0) await Models.Guild.destroy({ where: { id: guildId } });
};

const listGuildSources = async (guildId: string) => {
  const sources = await Models.Source.findAll({
    include: [
      {
        model: Models.Channel,
        through: {
          where: { guildId },
        },
      },
    ],
  });

  return sources.map((source) => source.toJSON());
};

const getChannelTags = async (channelId: string) => {
  const tags = await Models.Tag.findAll({ where: { channelId }, attributes: ["name"] });

  return tags;
};

export { initDatabase, addSource, deleteSource, listGuildSources, getChannelTags };
