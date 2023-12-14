import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import sequelize from "@/bdd/sequelize";
import Tag from "@/bdd/models/tag";
import Source from "@/bdd/models/source";
import Guild from "@/bdd/models/guild";

class Channel extends Model<InferAttributes<Channel>, InferCreationAttributes<Channel>> {
  declare id: CreationOptional<string>;
  declare guildId: ForeignKey<Guild["id"]>;

  declare getTags: HasManyGetAssociationsMixin<Tag>;
  declare countTags: HasManyCountAssociationsMixin;
  declare hasTag: HasManyHasAssociationMixin<Tag, string>;
  declare hasTags: HasManyHasAssociationMixin<Tag[], string>;
  declare addTag: HasManyAddAssociationMixin<Tag, string>;
  declare addTags: HasManyAddAssociationsMixin<Tag[], string>;
  declare removeTag: HasManyRemoveAssociationMixin<Tag, string>;
  declare removeTags: HasManyRemoveAssociationsMixin<Tag[], string>;
  declare createTag: HasManyCreateAssociationMixin<Tag, "channelId">;

  declare getSources: HasManyGetAssociationsMixin<Source>;
  declare countSources: HasManyCountAssociationsMixin;
  declare hasSource: HasManyHasAssociationMixin<Source, string>;
  declare hasSources: HasManyHasAssociationMixin<Source[], string>;
  declare addSource: HasManyAddAssociationMixin<Source, string>;
  declare addSources: HasManyAddAssociationsMixin<Source[], string>;
  declare removeSource: HasManyRemoveAssociationMixin<Source, string>;
  declare removeSources: HasManyRemoveAssociationsMixin<Source[], string>;
  declare createSource: HasManyCreateAssociationMixin<Source, "channelId">;
}

Channel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "channels",
    timestamps: false,
  }
);

export default Channel;
