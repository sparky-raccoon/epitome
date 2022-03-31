const { MessageEmbed } = require("discord.js");
const { blockQuote, bold } = require('@discordjs/builders');
const { AVATAR_URL } = require('../commons');

module.exports = {
    name: 'add-confirm',
    data: new MessageEmbed()
        .setColor('#ffffff')
        .setTitle("Les informations de la source de publications configurée sont-elles exactes ?")
        .setDescription(blockQuote(`Type: YouTube\nChaîne: The Train Code\nUrl: https://youtube.com/channel/xxx`))
        .setFooter({ text: 'Ajout de source (3/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};