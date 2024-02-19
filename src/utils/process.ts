import { ChatInputCommandInteraction, ComponentType } from "discord.js";
import { Command, Message, INTERNAL_ERROR, BUTTON_CONFIRM_ID } from "@/utils/constants";
import {
  findDuplicateTagWithName,
  addTag,
  deleteSource,
  listEverything,
  deleteTag,
  getSourceOrTagWithName,
} from "@/bdd/operator";
import { getRssNameFromUrl } from "@/utils/parser";
import { getMessage } from "@/utils/messages";
import { Tag, TagCreation } from "@/bdd/models/tag";
import logger from "@/utils/logger";
import { reply, editReply } from "@/utils/replier";
import { isSource, isTag } from "@/utils/types";
import FirestoreSource from "@/bdd/collections/source";

const TIMEOUT = 60000;

class Process {
  interaction: ChatInputCommandInteraction;
  terminate: (userId: string) => void;

  constructor(interaction: ChatInputCommandInteraction, terminate: (userId: string) => void) {
    this.interaction = interaction;
    this.terminate = terminate;

    switch (this.interaction.commandName) {
      case Command.ADD_SOURCE:
        this.addSource();
        break;
      case Command.ADD_FILTER:
        this.addFilter();
        break;
      case Command.DELETE:
        this.delete();
        break;
      case Command.LIST:
        this.list();
        break;
    }
  }

  async addSource() {
    try {
      await this.interaction.deferReply();

      const { guildId, channelId } = this.interaction;
      const sources = this.interaction.options
        .getString("urls")
        ?.split(" ")
        .map((url) => ({ url }));
      if (!guildId || !channelId || !sources || sources.length === 0)
        throw new Error(INTERNAL_ERROR);

      const duplicates = []
      const nonDuplicates = []
      for (const s of sources) {
        const { url } = s
        const existing = await FirestoreSource.findWithUrl(url);
        if (existing) {
          if (existing.channels.includes(channelId)) duplicates.push(existing);
          else {
            nonDuplicates.push({
            ...existing,
            channels: [...existing.channels, channelId]
           });
          }
        } else {
          const name = await getRssNameFromUrl(url);
          if (name) nonDuplicates.push({ url, name, channels: [channelId] });
        }
      }

      if (duplicates.length === sources.length) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicates);
        await editReply(this.interaction, message);
        this.terminate(this.interaction.user.id);
        return;
      } else if (nonDuplicates.length === 0) {
        const message = getMessage(Message.ADD_NO_VALID_URL);
        await editReply(this.interaction, message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, { type: 'source', new: nonDuplicates, existing: duplicates });
      const response = await editReply(this.interaction, message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        for (const source of nonDuplicates) await FirestoreSource.add(source);
        message = getMessage(Message.ADD_SUCCESS_SOURCE);
        await confirmInteraction.update(message[0]);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) await this.error(err.message);
      else if (typeof err === "string") await this.error(err);
    }
  }

  async addFilter() {
    try {
      await this.interaction.deferReply();

      const { guildId, channelId } = this.interaction;
      const tags = this.interaction.options
        .getString("names")
        ?.split(" ")
        .map((name) => ({ name }));
      if (!guildId || !channelId || !tags || tags.length === 0) throw new Error(INTERNAL_ERROR);

      const duplicates: Tag[] = [];
      const nonDuplicates: TagCreation[] = [];
      for (const t of tags) {
        const duplicate = await findDuplicateTagWithName(channelId, t.name);
        if (duplicate) duplicates.push(duplicate);
        else nonDuplicates.push(t);
      }

      if (duplicates.length === tags.length) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicates);
        await editReply(this.interaction, message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, { new: nonDuplicates, existing: duplicates });
      const response = await editReply(this.interaction, message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        for (const tag of nonDuplicates) await addTag(guildId, channelId, tag);
        message = getMessage(Message.ADD_SUCCESS_TAG);
        await confirmInteraction.update(message[0]);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) await this.error(err.message);
      else if (typeof err === "string") await this.error(err);
    }
  }

  async delete() {
    try {
      await this.interaction.deferReply();

      const { guildId, channelId, options } = this.interaction;
      const name = options.getString("nom");
      if (!guildId || !channelId || !name) throw new Error(INTERNAL_ERROR);

      const selectedSourceOrTag = await getSourceOrTagWithName(name);
      if (!selectedSourceOrTag) throw new Error("Ce filtre ou cette source n'existe pas, ou plus.");

      let message = getMessage(Message.DELETE_CONFIRM, selectedSourceOrTag);
      const response = await editReply(this.interaction, message);

      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        if (isSource(selectedSourceOrTag)) {
          await deleteSource(guildId, channelId, selectedSourceOrTag.id);
          message = getMessage(Message.DELETE_SUCCESS_SOURCE, selectedSourceOrTag);
        } else if (isTag(selectedSourceOrTag)) {
          await deleteTag(guildId, channelId, selectedSourceOrTag.name);
          message = getMessage(Message.DELETE_SUCCESS_TAG, selectedSourceOrTag);
        }
        await confirmInteraction.update(message[0]);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) await this.error(err.message);
      else if (typeof err === "string") await this.error(err);
    }
  }

  async list() {
    try {
      const { guildId, channelId } = this.interaction;
      if (!guildId || !channelId) throw new Error(INTERNAL_ERROR);

      await this.interaction.deferReply();

      const list = await listEverything(channelId);
      const message = getMessage(Message.LIST, list);
      await editReply(this.interaction, message);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) await this.error(err.message);
      else if (typeof err === "string") await this.error(err);
    }
  }

  async cancel(interaction: ChatInputCommandInteraction) {
    const isCommandCancel = interaction.id !== this.interaction.id;
    const message = getMessage(Message.CANCEL);

    if (isCommandCancel) {
      await this.interaction.deleteReply();
      await reply(interaction, message);
    } else await editReply(interaction, message);

    setTimeout(() => {
      interaction.deleteReply();
    }, 3000);

    this.terminate(this.interaction.user.id);
  }

  async error(err: string) {
    logger.error(err);
    const message = getMessage(Message.ERROR, err);
    await editReply(this.interaction, message);
    this.terminate(this.interaction.user.id);
  }
}

export { Process };
