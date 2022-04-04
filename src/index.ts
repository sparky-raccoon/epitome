import { readdirSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Client, Collection, MessageEmbed } from 'discord.js';
import { confirmButton } from './components/confirm-button';
import { notificationMenu } from './components/notification-menu';

dotenv.config();
const messageFiles = readdirSync(path.resolve(__dirname, './messages')).filter((f: string) => f.endsWith('.ts'));

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
}) as (Client & { availableMessages: Collection<string, MessageEmbed> });

client.availableMessages = new Collection();
(async () => {
    for (const file of messageFiles) {
        const { message } = await import(`./messages/${file}`);
        const { name, data } = message;
        client.availableMessages.set(name, data);
    }
})();

client.on("ready", () => {
    console.log((`Logged in as ${client.user?.tag}`));
    client.user?.setActivity('les internets ✨', { type: 'LISTENING' });
});

client.on("messageCreate", (message: { content: string; channel: { send: (arg0: { embeds: any[]; components?: any[]; }) => void; }; }) => {
    if (message.content === "hi") {
        message.channel.send({ embeds: [client.availableMessages.get('add')], components: [notificationMenu] });
        message.channel.send({ embeds: [client.availableMessages.get('youtube')] });
        message.channel.send({ embeds: [client.availableMessages.get('ig')] });
        message.channel.send({ embeds: [client.availableMessages.get('twitter')] });
        message.channel.send({ embeds: [client.availableMessages.get('rss')] });
        message.channel.send({ embeds: [client.availableMessages.get('add-confirm')], components: [confirmButton]})
        message.channel.send({ embeds: [client.availableMessages.get('add-complete')] });
    }
})

client.on("interactionCreate", () => {
    // if (!interaction.isSelectMenu()) return;
})

client.login(process.env.TOKEN).then(res => console.log(res));
