import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  Attributes,
  CreationAttributes,
} from "sequelize";
import sequelize from "@/bdd/sequelize";
import Channel from "@/bdd/models/channel";

type SourceAttributes = Attributes<Source>;
type SourceCreationAttributes = CreationAttributes<Source>;

class Source extends Model<InferAttributes<Source>, InferCreationAttributes<Source>> {
  declare id: CreationOptional<string>;
  declare channelId: ForeignKey<Channel["id"]>;
  declare type: string;
  declare name: string;
  declare url: string;
}

Source.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "RSS",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "sources",
    timestamps: false,
  }
);

export { SourceAttributes as Source };
export { SourceCreationAttributes as SourceCreation };
export default Source;
