import { MessageEmbed } from 'discord.js';
import { AVATAR_URL } from '../commons';

export const message = {
    name: 'add-complete',
    data: new MessageEmbed()
        .setColor('#ffffff')
        .setTitle("C'est prêt ! ✨")
        .setFooter({ text: 'Ajout de source (4/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};