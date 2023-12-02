import { ModelDefined, DataTypes, Optional } from "sequelize";
import sequelize from "@/bdd/sequelize";
import Channel from "@/bdd/models/channel";

interface TagAttributes {
  id: string;
  channelId: string;
  name: string;
}

interface TagCreationAttributes extends Optional<TagAttributes, "id"> {}

const Tag: ModelDefined<TagAttributes, TagCreationAttributes> = sequelize.define(
  "Tag",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    channelId: DataTypes.STRING,
    name: DataTypes.STRING,
  },
  {
    tableName: "tags",
  }
);

Tag.belongsTo(Channel, { foreignKey: "channelId", as: "tags" });

export default Tag;
