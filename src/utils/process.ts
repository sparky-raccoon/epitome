import { ChatInputCommandInteraction, ComponentType } from "discord.js";
import { Command, Message, SourceType, INTERNAL_ERROR, BUTTON_CONFIRM_ID } from "@/constants";
import {
  addSource,
  deleteSource,
  listSources,
  findDuplicateSourceWithUrl,
  getRssNameFromUrl,
} from "@/utils/source";
import { getMessage } from "@/utils/messages";
import { Source } from "@/types";
import logger from "./logger";

const TIMEOUT = 60000;

class Process {
  interaction: ChatInputCommandInteraction;
  terminate: (userId: string) => void;

  constructor(interaction: ChatInputCommandInteraction, terminate: (userId: string) => void) {
    this.interaction = interaction;
    this.terminate = terminate;

    switch (this.interaction.commandName) {
      case Command.ADD:
        this.add();
        break;
      case Command.DELETE:
        this.delete();
        break;
      case Command.LIST:
        this.list();
        break;
    }
  }

  async add() {
    try {
      await this.interaction.deferReply();

      const url = this.interaction.options.getString("url");
      if (!url) throw new Error(INTERNAL_ERROR);

      const type = SourceType.RSS;
      const name = await getRssNameFromUrl(url);
      const source: Source = { name, url, type };

      const duplicateSource = await findDuplicateSourceWithUrl(url);
      if (duplicateSource) {
        const message = getMessage(Message.ADD_ALREADY_EXISTS, duplicateSource);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      let message = getMessage(Message.ADD_CONFIRM, source);
      const response = await this.interaction.editReply(message);
      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        await addSource(source);
        message = getMessage(Message.ADD_SUCCESS, source);
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

      let message;
      const sourceList = await listSources();

      if (Object.keys(sourceList).length === 0) {
        message = getMessage(Message.DELETE_NO_SAVED_SOURCES);
        await this.interaction.editReply(message);
        this.terminate(this.interaction.user.id);
        return;
      }

      message = getMessage(Message.DELETE_SELECT, sourceList);
      let response = await this.interaction.editReply(message);
      const selectInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.StringSelect,
      });
      const selectedValue = selectInteraction.values[0];
      const [type, name] = selectedValue.split("-");
      const selectedIncompleteSource = sourceList[type as SourceType]?.[name];

      if (!selectedIncompleteSource) throw new Error(INTERNAL_ERROR);

      const source = {
        ...selectedIncompleteSource,
        type: type as SourceType,
        name,
      };
      message = getMessage(Message.DELETE_CONFIRM, source);
      response = await selectInteraction.update(message);

      const confirmInteraction = await response.awaitMessageComponent({
        time: TIMEOUT,
        componentType: ComponentType.Button,
      });

      if (confirmInteraction.customId === BUTTON_CONFIRM_ID) {
        await deleteSource(name, type as SourceType);
        message = getMessage(Message.DELETE_SUCCESS, source);
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
      await this.interaction.deferReply();

      const sourceList = await listSources();
      const message = getMessage(Message.LIST, sourceList);
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
