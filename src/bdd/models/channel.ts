import { ModelDefined, DataTypes } from "sequelize";
import sequelize from "@/bdd/sequelize";
import Guild from "@/bdd/models/guild";

interface ChannelAttributes {
  id: string;
  guildId: string;
}

interface ChannelCreationAttributes extends ChannelAttributes {}

const Channel: ModelDefined<ChannelAttributes, ChannelCreationAttributes> = sequelize.define(
  "Channel",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    guildId: DataTypes.STRING,
  },
  { tableName: "channels" }
);

Channel.belongsTo(Guild, { foreignKey: "guildId", as: "channels" });

export default Channel;
