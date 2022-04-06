import dotenv from 'dotenv';
import { Client, MessageActionRow, MessageEmbed } from 'discord.js';
import { getMessage } from './messages';
import { MessageTypes } from './types';

dotenv.config();

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
});

client.on("ready", () => {
    console.log((`Logged in as ${client.user?.tag}`));
    client.user?.setActivity('les internets ✨', { type: 'LISTENING' });
});

client.on("messageCreate", (message: { content: string; channel: { send: (arg0: { embeds: MessageEmbed[]; components?: MessageActionRow[]; }) => void; }; }) => {
    if (Object.values(MessageTypes).includes(message.content as MessageTypes)) {
        const messageToSend: MessageEmbed = getMessage(message.content as MessageTypes);
        message.channel.send({ embeds: [ messageToSend ] });
    }
})

client.on("interactionCreate", () => {
    // if (!interaction.isSelectMenu()) return;
})

client.login(process.env.TOKEN).then(res => console.log(res));
