import dotenv from 'dotenv';
import {
    Client,
    DMChannel, Interaction,
    Message,
    MessageActionRow,
    MessageEmbed,
    NewsChannel,
    PartialDMChannel,
    TextChannel,
    ThreadChannel
} from 'discord.js';
import { inlineCode } from '@discordjs/builders';
import { getMessage } from './messages';
import { MessageTypes, Source, SourceTypes, MessageData } from './types';
import { AddFlow, DeleteFlow } from './flows';
import { addSource } from './utils';

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

type Flow = AddFlow | DeleteFlow;
type Channel = TextChannel | NewsChannel | DMChannel | PartialDMChannel | ThreadChannel;

const sendFlowMessage = async (flow: Flow, channel: Channel, data?: MessageData) => {
    const messageType = flow.messageType();
    const { embed, component } = getMessage(messageType, data);
    if (!embed) return;

    let messageToSend: { embeds: MessageEmbed[], components?: MessageActionRow[] } = { embeds: [embed] };
    if (component)
        messageToSend = { ...messageToSend, components: [component] }

    const sentMessage: Message = await channel.send(messageToSend);
    flow.setLastMessage(sentMessage);
}

const proceedFlow = async (flow: Flow, channel: Channel, data?: { messageData?: MessageData, messageSubType?: string }) => {
    flow.next(data?.messageSubType || '');
    await sendFlowMessage(flow, channel, data?.messageData);
}

let currentFlow: Flow | undefined;
client.on("messageCreate", async (message: Message) => {
    const { content: messageContent, author: { id: messageAuthor }, channel } = message;
    console.log(`${messageAuthor}: ${messageContent}`);
    const isCommandMessage =
        messageContent === "!add" ||
        messageContent === "!delete";

    if (!currentFlow) {
        if (isCommandMessage) {
            if (messageContent === "!add") currentFlow = new AddFlow(messageAuthor);
            else currentFlow = new DeleteFlow(messageAuthor);

            // AddFlow/DeleteFlow: Step 0 -> 1
            await message.delete();
            await proceedFlow(currentFlow, channel);
        }
    }

    if (currentFlow && messageAuthor === currentFlow.initiator() && !currentFlow.isAtInteractiveStep()) {
        if (currentFlow instanceof AddFlow) {
            // AddFlow: Step 2 -> 3
            const sourceQuery = messageContent;
            const messageType = currentFlow.messageType();
            const sourceType = messageType === MessageTypes.ADD_INSTAGRAM ?
                SourceTypes.INSTAGRAM: messageType === MessageTypes.ADD_TWITTER ?
                    SourceTypes.TWITTER : messageType === MessageTypes.ADD_YOUTUBE ?
                        SourceTypes.YOUTUBE: SourceTypes.RSS;
            const sourceToAdd = {
                type: sourceType,
                name: sourceQuery,
                url: sourceQuery,
            }

            currentFlow.setSourceToAdd(sourceToAdd);
            await proceedFlow(currentFlow, channel, { messageData: sourceToAdd });
        } else {
            // DeleteFlow: Step 1 -> 2
        }
    }
})

client.on("interactionCreate", async (interaction: Interaction) => {
    if (currentFlow && interaction.user.id === currentFlow.initiator() ) {
        console.log('interaction user is initiator of current flow');
        if (interaction.isSelectMenu()) {
            // AddFlow: Step 1 -> 2
            const sourceType = interaction.values[0];
            await interaction.deferUpdate();

            const lastMessage = currentFlow.getLastMessage();
            await (lastMessage as Message).delete();

            await proceedFlow(currentFlow, interaction.channel as Channel, { messageSubType: sourceType })
        } else {
            // FIXME: for some reasons, ts doesn't seem to recognize ButtonInteraction to hold
            // the customId property.
            const isYesButtonClicked = (interaction as Interaction & { customId: string }).customId === 'confirm-yes-button';
            if (currentFlow instanceof AddFlow) {
                // @ts-ignore
                await interaction.deferUpdate();
                // AddFlow:
                // isYesButtonClicked === true ? Step 3 -> 4 : Repeat Step 3
                if (isYesButtonClicked) {
                    const sourceToAdd = currentFlow.getSourceToAdd();
                    await addSource(sourceToAdd as Source);

                    const lastMessage = currentFlow.getLastMessage();
                    await (lastMessage as Message).delete();

                    await proceedFlow(currentFlow, interaction.channel as Channel, { messageData: sourceToAdd });
                    currentFlow = undefined;
                } else {
                   console.log('add: user retry');
                   currentFlow.errorOrRetry();
                   const retryMessage = `Peut-être il y a-t-il eu un mispelling dans le nom de compte / chaîne ou url que tu viens de donner. Réessaie, ou tape la commande ${inlineCode('!cancel')} pour annuler cette procédure d'ajout!`
                   await sendFlowMessage(currentFlow, interaction.channel as Channel, retryMessage);
                }
            } else {
                console.log('delete: user clicked yes/no button');
            }
        }
    }
})

client.login(process.env.TOKEN).then(res => console.log(res));
