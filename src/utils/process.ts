import { ChatInputCommandInteraction, ComponentType } from "discord.js";
import {
  Command,
  Message,
  SourceType,
  INTERNAL_ERROR,
  BUTTON_CONFIRM_ID,
} from "@/constants";
import { deleteSource, listSources } from "@/utils/source";
import { getMessage } from "@/utils/messages";

const TIMEOUT = 60000;

class Process {
  interaction: ChatInputCommandInteraction;
  terminate: (userId: string) => void;
  step: number;

  constructor(
    interaction: ChatInputCommandInteraction,
    terminate: (userId: string) => void
  ) {
    this.interaction = interaction;
    this.terminate = terminate;
    this.step = 0;

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
    this.interaction.reply("add");
  }

  async delete() {
    try {
      if (this.step === 0) {
        const sourceList = await listSources();
        let message = getMessage(Message.DELETE_SELECT, sourceList);

        let response = await this.interaction.reply(message);
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
      }
    } catch (err) {
      if (err instanceof Error) this.error(err.message);
      else if (typeof err === "string") this.error(err);
    }
  }

  async list() {
    try {
      const sourceList = await listSources();
      const message = getMessage(Message.LIST, sourceList);
      this.interaction.reply(message);

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
    const message = getMessage(Message.ERROR, err);
    this.interaction.editReply(message);
    this.terminate(this.interaction.user.id);
  }
}

export { Process };
