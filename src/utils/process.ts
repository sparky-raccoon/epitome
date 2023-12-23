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
import { Source, SourceCreation } from "@/bdd/models/source";
import { Tag, TagCreation } from "@/bdd/models/tag";
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
      const sources = this.interaction.options
        .getString("urls")
        ?.split(" ")
        .map((url) => ({ url }));
      if (!guildId || !channelId || !sources || sources.length === 0)
        throw new Error(INTERNAL_ERROR);

      const duplicates: Source[] = [];
      const nonDuplicates: SourceCreation[] = [];
      for (const s of sources) {
        const duplicate = await findDuplicateSourceWithUrl(channelId, s.url);
        if (duplicate) duplicates.push(duplicate);
        else {
          const name = await getRssNameFromUrl(s.url);
          nonDuplicates.push({ ...s, name });
        }
      }

      if (duplicates.length === sources.length) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicates);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, { new: nonDuplicates, existing: duplicates });
      const response = await this.interaction.editReply(message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        for (const source of nonDuplicates) await addSource(guildId, channelId, source);
        message = getMessage(Message.ADD_SUCCESS_SOURCE);
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
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, { new: nonDuplicates, existing: duplicates });
      const response = await this.interaction.editReply(message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        for (const tag of nonDuplicates) await addTag(guildId, channelId, tag);
        message = getMessage(Message.ADD_SUCCESS_TAG);
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
