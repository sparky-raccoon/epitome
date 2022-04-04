import { MessageEmbed } from 'discord.js';
import { bold } from '@discordjs/builders';
import { TAKING_NOTES_IMG_URL, AVATAR_URL} from '../commons';

export const message = {
    name: 'rss',
    data: new MessageEmbed()
        .setColor('#ee802f')
        .setTitle("Ajout d'un flux RSS dans la liste des sources suivies")
        .setDescription(`Indique sous forme de message une url valide de feed RSS.\nPar exemple: ${bold('https://www.lemonde.fr/rss/en_continu.xml')}`)
        .setImage(TAKING_NOTES_IMG_URL)
        .setFooter({ text: 'Ajout de source (2/4)', iconURL: AVATAR_URL })
        .setTimestamp()
};