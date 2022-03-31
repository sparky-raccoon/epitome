const { MessageEmbed } = require("discord.js");
const { bold } = require('@discordjs/builders');
const { TAKING_NOTES_IMG_URL, AVATAR_URL } = require('../commons');

module.exports = {
    name: 'youtube',
    data: new MessageEmbed()
        .setColor('#FF0000')
        .setTitle("Ajout d'une chaîne YouTube dans la liste des sources suivies")
        .setDescription(`Indique sous forme de message une url valide de chaîne.\nPar exemple: ${bold('https://www.youtube.com/channel/xxx')}`)
        .setImage(TAKING_NOTES_IMG_URL)
        .setFooter({ text: 'Ajout de source (2/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};