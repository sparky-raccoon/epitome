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
  declare type: CreationOptional<string>;
  declare name: string;
  declare url: string;
  declare timestamp: CreationOptional<string>;
}

Source.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    timestamp: {
      type: DataTypes.STRING,
      defaultValue: 0,
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
