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

type TagAttributes = Attributes<Tag>;
type TagCreationAttributes = CreationAttributes<Tag>;

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<number>;
  declare channelId: ForeignKey<Channel["id"]>;
  declare name: string;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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

export { TagAttributes as Tag };
export { TagCreationAttributes as TagCreation };
export default Tag;
