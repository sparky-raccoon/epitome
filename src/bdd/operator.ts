import { Sequelize } from "sequelize";
import Parser from "rss-parser";
import sequelize from "@/bdd/sequelize";
import { Source, SourceCreation } from "@/bdd/models/source";
import Models from "@/bdd/models/index";
import logger from "@/utils/logger";

const initDatabase = async (): Promise<Sequelize> => {
  logger.info("Initializing database", process.env.NODE_ENV);
  await sequelize.authenticate();
  sequelize.sync({ force: true });

  return sequelize;
};

const addTag = async (channelId: string, name: string): Promise<void> => {
  const existingTag = await Models.Tag.findOne({ where: { channelId, name } });
  if (existingTag) throw new Error("Ce tag existe déjà.");

  await Models.Tag.create({ channelId, name });
};

const findDuplicateSourceWithUrl = async (url: string): Promise<Source | null> => {
  const source = await Models.Source.findOne({ where: { url } });
  return source ? source.toJSON() : null;
};

const addSource = async (
  guildId: string,
  channelId: string,
  newSource: SourceCreation
): Promise<void> => {
  logger.info(`Adding source ${newSource.name} to channel ${channelId} in guild ${guildId}`);
  let guild = await Models.Guild.findByPk(guildId);
  if (!guild) guild = await Models.Guild.create({ id: guildId });
  logger.info(`Guild ${guildId} found`);

  let channel = await Models.Channel.findByPk(channelId);
  if (!channel) channel = await guild.createChannel({ id: channelId });
  logger.info(`Channel ${channelId} found`);

  const source = await Models.Source.findOne({ where: { url: newSource.url } });
  if (source) throw new Error("Cette source de publications existe déjà.");
  else channel.createSource(newSource);
};

const deleteSource = async (
  guildId: string,
  channelId: string,
  sourceId: string
): Promise<void> => {
  const source = await Models.Source.findByPk(sourceId);
  if (!source) throw new Error("Cette source de publications n'existe pas, ou plus.");

  await Models.Source.destroy({ where: { id: sourceId } });
};

const listGuildSources = async (guildId: string): Promise<Source[]> => {
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

const getRssNameFromUrl = async (url: string): Promise<string> => {
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  return feed.title || "Undefined";
};

export {
  initDatabase,
  addTag,
  findDuplicateSourceWithUrl,
  addSource,
  deleteSource,
  listGuildSources,
  getChannelTags,
  getRssNameFromUrl,
};
