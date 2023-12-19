import Guild from "@/bdd/models/guild";
import Channel from "@/bdd/models/channel";
import Source from "@/bdd/models/source";
import Tag from "@/bdd/models/tag";

Guild.hasMany(Channel, { foreignKey: "guildId", as: "channels" });
Channel.hasMany(Tag, { foreignKey: "channelId", as: "tags" });
Channel.hasMany(Source, { foreignKey: "channelId", as: "sources" });

const Models = {
  Guild,
  Channel,
  Source,
  Tag,
};

export default Models;
