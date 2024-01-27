// FIXME: any[] should be replaced with MessagePayload[] or MessageOptions[] (?)
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction, Message, InteractionResponse } from "discord.js";

const _r = async (
  interaction: ChatInputCommandInteraction,
  messages: any[],
  isEdit: boolean
): Promise<Message<boolean> | InteractionResponse<boolean>> => {
  let firstMessage;
  if (isEdit) firstMessage = await interaction.editReply(messages[0]);
  else firstMessage = await interaction.reply(messages[0]);

  for (let i = 1; i < messages.length; i++) await interaction.followUp(messages[i]);

  return firstMessage;
};

const reply = async (i: ChatInputCommandInteraction, m: any[]) => _r(i, m, false);
const editReply = async (i: ChatInputCommandInteraction, m: any[]) => _r(i, m, true);

export { reply, editReply };
