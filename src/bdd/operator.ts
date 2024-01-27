import { Sequelize } from "sequelize";
import sequelize from "@/bdd/sequelize";
import { Tag, TagCreation } from "@/bdd/models/tag";
import { Source, SourceCreation } from "@/bdd/models/source";
import Models from "@/bdd/models/index";
import logger from "@/utils/logger";

const initDatabase = async (): Promise<Sequelize> => {
  logger.info("Initializing database", process.env.NODE_ENV);
  await sequelize.authenticate();
  await sequelize.sync();
  return sequelize;
};

const cleanDatabaseOnGuildLeave = async (guildId: string): Promise<void> => {
  const guild = await Models.Guild.findByPk(guildId);
  if (guild) await guild.destroy({ force: true });
};

const cleanDatabaseOnChannelLeave = async (channelId: string): Promise<void> => {
  const channel = await Models.Channel.findByPk(channelId);
  if (channel) await channel.destroy({ force: true });
};

const findDuplicateSourceWithUrl = async (
  channelId: string,
  url: string
): Promise<Source | null> => {
  const source = await Models.Source.findOne({ where: { channelId, url } });
  return source ? source.toJSON() : null;
};

const findDuplicateTagWithName = async (channelId: string, name: string): Promise<Tag | null> => {
  const tag = await Models.Tag.findOne({ where: { channelId, name } });
  return tag;
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

  const source = await Models.Source.findOne({ where: { channelId, url: newSource.url } });
  if (source) throw new Error("Cette source de publications existe déjà.");
  else await channel.createSource(newSource);
};

const addTag = async (guildId: string, channelId: string, newTag: TagCreation): Promise<void> => {
  let guild = await Models.Guild.findByPk(guildId);
  if (!guild) guild = await Models.Guild.create({ id: guildId });

  let channel = await Models.Channel.findByPk(channelId);
  if (!channel) channel = await guild.createChannel({ id: channelId });

  const tag = await Models.Tag.findOne({ where: { channelId, name: newTag.name } });
  if (tag) throw new Error("Ce filtre existe déjà.");
  else await channel.createTag(newTag);
};

const deleteSource = async (
  guildId: string,
  channelId: string,
  sourceId: string
): Promise<void> => {
  const source = await Models.Source.findByPk(sourceId);
  if (source) await source.destroy({ force: true });

  const channelSources = await listChannelSources(channelId);
  if (channelSources.length === 0)
    Models.Channel.destroy({ force: true, where: { id: channelId } });

  const guildChannels = await Models.Channel.findAll({ where: { guildId } });
  if (guildChannels.length === 0) Models.Guild.destroy({ force: true, where: { id: guildId } });
};

const deleteTag = async (guildId: string, channelId: string, name: string): Promise<void> => {
  const tag = await Models.Tag.findOne({ where: { name } });
  if (tag) await tag.destroy({ force: true });

  const channelTags = await listChannelTags(channelId);
  if (channelTags.length === 0) Models.Channel.destroy({ force: true, where: { id: channelId } });

  const guildChannels = await Models.Channel.findAll({ where: { guildId } });
  if (guildChannels.length === 0) Models.Guild.destroy({ force: true, where: { id: guildId } });
};

const getSourceOrTagWithName = async (name: string): Promise<Source | Tag | null> => {
  const source = await Models.Source.findOne({ where: { name } });
  if (source) return source;

  const tag = await Models.Tag.findOne({ where: { name } });
  if (tag) return tag;

  return null;
};

const listChannelIds = async (): Promise<string[]> => {
  const channels = await Models.Channel.findAll();
  return channels.map((c) => c.id);
};

const listChannelSources = async (channelId: string): Promise<Source[]> => {
  const sources = await Models.Source.findAll({ where: { channelId } });
  return sources;
};

const listChannelTags = async (channelId: string): Promise<Tag[]> => {
  const tags = await Models.Tag.findAll({ where: { channelId } });
  return tags;
};

const listEverything = async (channelId: string): Promise<(Source | Tag)[]> => {
  const sources = await listChannelSources(channelId);
  const tags = await listChannelTags(channelId);
  return [...sources, ...tags];
};

const updateSourceTimestamp = async (sourrceId: string, timestamp: string): Promise<void> => {
  await Models.Source.update({ timestamp }, { where: { id: sourrceId } });
};

export {
  initDatabase,
  cleanDatabaseOnGuildLeave,
  cleanDatabaseOnChannelLeave,
  findDuplicateSourceWithUrl,
  findDuplicateTagWithName,
  addSource,
  addTag,
  deleteSource,
  deleteTag,
  listChannelIds,
  listChannelSources,
  listChannelTags,
  listEverything,
  updateSourceTimestamp,
  getSourceOrTagWithName,
};
