import { MessageEmbed } from 'discord.js';
import { blockQuote, bold } from '@discordjs/builders';
import { AVATAR_URL } from '../commons';

export const message = {
    name: 'add-confirm',
    data: new MessageEmbed()
        .setColor('#ffffff')
        .setTitle("Les informations de la source de publications configurée sont-elles exactes ?")
        .setDescription(blockQuote(`Type: YouTube\nChaîne: The Train Code\nUrl: https://youtube.com/channel/xxx`))
        .setFooter({ text: 'Ajout de source (3/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};