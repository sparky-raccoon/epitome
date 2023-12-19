import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
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
import Channel from "@/bdd/models/channel";

class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
  declare id: CreationOptional<string>;

  declare getChannels: HasManyGetAssociationsMixin<Channel>;
  declare countChannels: HasManyCountAssociationsMixin;
  declare hasChannel: HasManyHasAssociationMixin<Channel, string>;
  declare hasChannels: HasManyHasAssociationMixin<Channel[], string>;
  declare addChannel: HasManyAddAssociationMixin<Channel, string>;
  declare addChannels: HasManyAddAssociationsMixin<Channel[], string>;
  declare removeChannel: HasManyRemoveAssociationMixin<Channel, string>;
  declare removeChannels: HasManyRemoveAssociationsMixin<Channel[], string>;
  declare createChannel: HasManyCreateAssociationMixin<Channel, "guildId">;
}

Guild.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "guilds",
    timestamps: false,
  }
);

export default Guild;
