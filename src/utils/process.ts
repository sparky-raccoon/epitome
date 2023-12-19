import { ChatInputCommandInteraction, ComponentType, Message as DiscordMessage } from "discord.js";
import { Command, Message, INTERNAL_ERROR, BUTTON_CONFIRM_ID } from "@/utils/constants";
import {
  findDuplicateSourceWithUrl,
  findDuplicateTagWithName,
  getRssNameFromUrl,
  addSource,
  addTag,
  deleteSource,
  listEverything,
  deleteTag,
} from "@/bdd/operator";
import { getMessage } from "@/utils/messages";
import { SourceCreation } from "@/bdd/models/source";
import logger from "@/utils/logger";
import { isSource, isTag } from "./types";

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
      const url = this.interaction.options.getString("url");
      if (!guildId || !channelId || !url) throw new Error(INTERNAL_ERROR);

      const duplicateSource = await findDuplicateSourceWithUrl(channelId, url);
      if (duplicateSource) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicateSource);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      const name = await getRssNameFromUrl(url);
      const source: SourceCreation = { name, url };

      let message = getMessage(Message.ADD_CONFIRM, source);
      const response = await this.interaction.editReply(message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        await addSource(guildId, channelId, source);
        message = getMessage(Message.ADD_SUCCESS_SOURCE, source);
        await confirmInteraction.update(message);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) this.error(err.message);
      else if (typeof err === "string") this.error(err);
    }
  }

  async addFilter() {
    try {
      await this.interaction.deferReply();

      const { guildId, channelId } = this.interaction;
      const name = this.interaction.options.getString("name");
      if (!guildId || !channelId || !name) throw new Error(INTERNAL_ERROR);

      const duplicateTag = await findDuplicateTagWithName(channelId, name);
      if (duplicateTag) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicateTag);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, { name });
      const response = await this.interaction.editReply(message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        await addTag(guildId, channelId, name);
        message = getMessage(Message.ADD_SUCCESS_TAG, name);
        await confirmInteraction.update(message);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) this.error(err.message);
      else if (typeof err === "string") this.error(err);
    }
  }

  async delete() {
    try {
      await this.interaction.deferReply();

      const { guildId, channelId } = this.interaction;
      if (!guildId || !channelId) throw new Error(INTERNAL_ERROR);

      let message;
      const fullList = await listEverything(channelId);

      if (fullList.length === 0) {
        message = getMessage(Message.DELETE_NOTHING_SAVED);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      message = getMessage(Message.DELETE_SELECT, fullList);

      let response = await this.interaction.editReply(message);
      const selectInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.StringSelect,
      });
      const selectedId = selectInteraction.values[0];
      const selectedSourceOrTag = fullList.find((sourceOrTag) => sourceOrTag.id === selectedId);

      if (!selectedSourceOrTag) throw new Error(INTERNAL_ERROR);

      message = getMessage(Message.DELETE_CONFIRM, selectedSourceOrTag);
      response = (await selectInteraction.update(message)) as unknown as DiscordMessage;

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
        await confirmInteraction.update(message);
      } else this.cancel(this.interaction);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) this.error(err.message);
      else if (typeof err === "string") this.error(err);
    }
  }

  async list() {
    try {
      const { guildId, channelId } = this.interaction;
      if (!guildId || !channelId) throw new Error(INTERNAL_ERROR);

      await this.interaction.deferReply();

      const list = await listEverything(channelId);
      const message = getMessage(Message.LIST, list);
      this.interaction.editReply(message);

      this.terminate(this.interaction.user.id);
    } catch (err) {
      if (err instanceof Error) this.error(err.message);
      else if (typeof err === "string") this.error(err);
    }
  }

  async cancel(interaction: ChatInputCommandInteraction) {
    const isCommandCancel = interaction.id !== this.interaction.id;
    const message = getMessage(Message.CANCEL);

    if (isCommandCancel) {
      await this.interaction.deleteReply();
      await interaction.reply(message);
    } else await interaction.editReply(message);

    setTimeout(() => {
      interaction.deleteReply();
    }, 3000);

    this.terminate(this.interaction.user.id);
  }

  error(err: string) {
    logger.error(err);
    const message = getMessage(Message.ERROR, err);
    this.interaction.editReply(message);
    this.terminate(this.interaction.user.id);
  }
}

export { Process };
