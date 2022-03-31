const { MessageEmbed } = require('discord.js');
const { bold } = require('@discordjs/builders');
const { AVATAR_URL } = require('../commons');

module.exports = {
    name: 'add',
    data: new MessageEmbed()
        .setColor('#ffffff')
        .setTitle("Config. d'une nouvelle source de publications à suivre ✨")
        .setDescription( `Choisis le type de publications à suivre (YouTube, Instagram, Twitter, ou un flux RSS) dans le sélecteur juste en-dessous ! 👇. Tu pourras envoyer le message ${bold('cancel')} à tout moment pour annuler cette procédure.`)
        .setImage('https://media2.giphy.com/media/xUNd9YJwF6ifDUnqNi/giphy.gif?cid=ecf05e47urk9pbl8rf9naps5mapxa5l7jvqceykq84q6hnfn&rid=giphy.gif&ct=g')
        .setFooter({ text: 'Ajout de source (1/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};

