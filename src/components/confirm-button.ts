import { MessageActionRow, MessageButton } from 'discord.js';

const confirmButton = new MessageActionRow()
    .addComponents([
            new MessageButton()
                .setCustomId('confirm-yes-button')
                .setLabel('Yes')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('confirm-no-button')
                .setLabel('No')
                .setStyle('SECONDARY'),
        ]
    )

export { confirmButton }
