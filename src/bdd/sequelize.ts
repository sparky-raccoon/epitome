import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";

const sequelize = new Sequelize("database", "username", "password", {
  dialect: "sqlite",
  host: "localhost",
  storage: "database.sqlite",
  logging: false,
});

class Guild extends Model<InferAttributes<Guild>, InferCreationAttributes<Guild>> {
  declare id: string;
}

Guild.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { sequelize }
);

class Channel extends Model<InferAttributes<Channel>, InferCreationAttributes<Channel>> {
  declare id: string;
  declare guildId: string;
}

Channel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    guildId: DataTypes.STRING,
  },
  { sequelize }
);

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: number;
  declare channelId: string;
  declare name: string;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    channelId: DataTypes.STRING,
    name: DataTypes.STRING,
  },
  { sequelize }
);

class Source extends Model<InferAttributes<Source>, InferCreationAttributes<Source>> {
  declare id: string;
  declare name: string;
  declare type: string;
}

Source.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    type: DataTypes.STRING,
  },
  { sequelize }
);

Guild.hasMany(Channel, { foreignKey: "guildId" });
Channel.hasMany(Tag, { foreignKey: "channelId" });
Source.belongsToMany(Channel, { through: "ChannelSource" });

export default sequelize;
