const fs = require('node:fs');
const messageFiles = fs.readdirSync('./messages').filter(f => f.endsWith('.js'));
const { Client, Collection, MessageActionRow, MessageSelectMenu, MessageButton} = require('discord.js');
const { confirmButton } = require('./components/confirm-button');
const { notificationMenu } = require('./components/notification-menu');
require('dotenv').config();

const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
});

client.availableMessages = new Collection();
for (const file of messageFiles) {
    const { name, data } = require(`./messages/${file}`);
    client.availableMessages.set(name, data);
}

client.on("ready", () => {
    console.log((`Logged in as ${client.user.tag}`));
    client.user.setActivity('les internets ✨', { type: 'LISTENING' });
});

client.on("messageCreate", message => {
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

client.on("interactionCreate", async interaction => {
    // if (!interaction.isSelectMenu()) return;
})

client.login(process.env.TOKEN).then(res => console.log(res));
