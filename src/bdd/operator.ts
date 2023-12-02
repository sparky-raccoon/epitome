import { Sequelize } from "sequelize";
import sequelize from "@/bdd/sequelize";
import { Source, SourceCreation } from "@/bdd/models/source";
import Models from "@/bdd/models/index";

const initDatabase = async (): Promise<Sequelize> => {
  await sequelize.authenticate();
  sequelize.sync({ force: process.env.NODE_ENV === "development" });

  return sequelize;
};

const addSource = async (
  guildId: string,
  channelId: string,
  source: SourceCreation
): Promise<void> => {
  const existingSource = await Models.Source.findOne({ where: { url: source.url } });
  if (existingSource) throw new Error("Cette source de publications existe déjà.");

  await Models.Source.create(source);
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

export { initDatabase, addSource, deleteSource, listGuildSources, getChannelTags };
