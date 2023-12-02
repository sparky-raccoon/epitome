import { ModelDefined, DataTypes } from "sequelize";
import sequelize from "@/bdd/sequelize";

interface GuildAttributes {
  id: string;
}

interface GuildCreationAttributes extends GuildAttributes {}

const Guild: ModelDefined<GuildAttributes, GuildCreationAttributes> = sequelize.define(
  "Guild",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { tableName: "guilds" }
);

export default Guild;
