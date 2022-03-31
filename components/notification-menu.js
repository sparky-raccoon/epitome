const { MessageActionRow, MessageSelectMenu } = require("discord.js");

const notificationMenu = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId('select-notif-type')
            .setPlaceholder('Chaîne YouTube')
            .addOptions([
                {
                    label: 'Chaîne YouTube',
                    value: 'youtube',
                },
                {
                    label: 'Compte Twitter',
                    value: 'twitter',
                },
                {
                    label: 'Compte Instagram',
                    value: 'ig',
                },
                {
                    label: 'Flux RSS',
                    value: 'rss',
                }
            ])
    )

module.exports = { notificationMenu }