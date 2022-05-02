import { Message, MessageActionRow, MessageEmbed } from 'discord.js';
import { Channel, Flow, MessageData } from '../types';
import { getMessage } from '../messages';

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

const deleteLastMessage = async (flow: Flow) => {
    const lastMessage = flow.getLastMessage();
    await (lastMessage as Message).delete();
}

const deleteLastMessageWithTimeout = (flow: Flow) => setTimeout(async () => {
    await deleteLastMessage(flow);
}, 5000)

const cancelFlow = async (flow: Flow, channel: Channel) => {
    await deleteLastMessage(flow);
    flow.cancel();
    await sendFlowMessage(flow, channel);

    await deleteLastMessageWithTimeout(flow);
}

export { sendFlowMessage, proceedFlow, deleteLastMessage, deleteLastMessageWithTimeout, cancelFlow }