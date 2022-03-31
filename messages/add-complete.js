const { MessageEmbed } = require("discord.js");
const { blockQuote, bold } = require('@discordjs/builders');
const { AVATAR_URL } = require('../commons');

module.exports = {
    name: 'add-complete',
    data: new MessageEmbed()
        .setColor('#ffffff')
        .setTitle("C'est prêt ! ✨")
        .setFooter({ text: 'Ajout de source (4/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};