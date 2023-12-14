import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
} from "sequelize";
import sequelize from "@/bdd/sequelize";
import Channel from "@/bdd/models/channel";

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<string>;
  declare channelId: ForeignKey<Channel["id"]>;
  declare name: string;
}

Tag.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: false,
  }
);

export default Tag;
