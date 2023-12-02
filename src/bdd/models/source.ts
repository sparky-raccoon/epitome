import { ModelDefined, DataTypes } from "sequelize";
import sequelize from "@/bdd/sequelize";
import Channel from "@/bdd/models/channel";

interface SourceAttributes {
  id: string;
  type: string;
  name: string;
  url: string;
}

interface SourceCreationAttributes extends Omit<SourceAttributes, "id"> {}

const Source: ModelDefined<SourceAttributes, SourceCreationAttributes> = sequelize.define(
  "Source",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    url: DataTypes.STRING,
  },
  { tableName: "sources" }
);

Source.belongsToMany(Channel, { through: "ChannelSource", as: "sources" });

export { SourceAttributes as Source };
export { SourceCreationAttributes as SourceCreation };
export default Source;
