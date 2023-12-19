import { Sequelize } from "sequelize";
import Parser from "rss-parser";
import sequelize from "@/bdd/sequelize";
import { Source, SourceCreation } from "@/bdd/models/source";
import Models from "@/bdd/models/index";
import logger from "@/utils/logger";

const initDatabase = async (): Promise<Sequelize> => {
  logger.info("Initializing database", process.env.NODE_ENV);
  await sequelize.authenticate();
  await sequelize.sync();

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
  let guild = await Models.Guild.findByPk(guildId);
  if (!guild) guild = await Models.Guild.create({ id: guildId });

  let channel = await Models.Channel.findByPk(channelId);
  if (!channel) channel = await guild.createChannel({ id: channelId });

  const source = await Models.Source.findOne({ where: { url: newSource.url } });
  if (source) throw new Error("Cette source de publications existe déjà.");
  else await channel.createSource(newSource);
};

const deleteSource = async (
  guildId: string,
  channelId: string,
  sourceId: number
): Promise<void> => {
  const source = await Models.Source.findByPk(sourceId);
  if (source) await source.destroy({ force: true });

  const channelSources = await listChannelSources(channelId);
  if (channelSources.length === 0)
    Models.Channel.destroy({ force: true, where: { id: channelId } });

  const guildChannels = await Models.Channel.findAll({ where: { guildId } });
  if (guildChannels.length === 0) Models.Guild.destroy({ force: true, where: { id: guildId } });
};

const listChannelIds = async (): Promise<string[]> => {
  const channels = await Models.Channel.findAll();
  return channels.map((c) => c.id);
};

const listChannelSources = async (channelId: string): Promise<Source[]> => {
  const sources = await Models.Source.findAll({ where: { channelId } });
  return sources;
};

const listChannelTags = async (channelId: string): Promise<string[]> => {
  const tags = await Models.Tag.findAll({ where: { channelId }, attributes: ["name"] });
  return tags.map((t) => t.name);
};

const updateSourceTimestamp = async (sourrceId: number, timestamp: string): Promise<void> => {
  await Models.Source.update({ timestamp }, { where: { id: sourrceId } });
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
  listChannelIds,
  listChannelSources,
  listChannelTags,
  updateSourceTimestamp,
  getRssNameFromUrl,
};
