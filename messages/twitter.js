const { MessageEmbed } = require("discord.js");
const { bold } = require('@discordjs/builders');
const { TAKING_NOTES_IMG_URL, AVATAR_URL} = require('../commons');

module.exports = {
    name: 'twitter',
    data: new MessageEmbed()
        .setColor('#1DA1F2')
        .setTitle("Ajout d'un compte Twitter dans la liste des sources suivies")
        .setDescription(`Indique sous forme de message un nom de compte existant.\nPar exemple: ${bold('@jane.doe')}`)
        .setImage(TAKING_NOTES_IMG_URL)
        .setFooter({ text: 'Ajout de source (2/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};