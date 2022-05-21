import dotenv from "dotenv";
import { Client, Interaction, Message } from "discord.js";
import { autoDestructionMessage, getMessage } from "./messages";
import { MessageTypes, SourceTypes, Source, Flow, Channel } from "./types";
import { AddFlow, DeleteFlow } from "./flows";
import {
  addSource,
  deleteSource,
  isSourceListEmpty,
  listSources,
} from "./utils/source";
import {
  sendFlowMessage,
  proceedFlow,
  deleteLastMessage,
  deleteLastMessageWithTimeout,
  cancelFlow,
} from "./utils/flow";

dotenv.config();

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  client.user?.setActivity("les internets ✨", { type: "LISTENING" });
});

let currentFlow: Flow | undefined;
client.on("messageCreate", async (message: Message) => {
  const {
    content: messageContent,
    author: { id: messageAuthor },
    channel,
  } = message;
  console.log(`${messageAuthor}: ${messageContent}`);

  const isAddCommand = messageContent === "!add";
  const isDeleteCommand = messageContent === "!delete";
  const isListCommand = messageContent === "!list";
  const isHelpCommand = messageContent === "!help";
  const isCancelCommand = messageContent === "!cancel";
  const isCommandMessage =
    isAddCommand ||
    isDeleteCommand ||
    isListCommand ||
    isHelpCommand ||
    isCancelCommand;

  if (!currentFlow) {
    if (isCommandMessage) {
      if (isAddCommand || isDeleteCommand) {
        if (isAddCommand) currentFlow = new AddFlow(messageAuthor);
        else currentFlow = new DeleteFlow(messageAuthor);

        // AddFlow/DeleteFlow: Step 0 -> 1
        await message.delete();
        if (currentFlow instanceof AddFlow)
          await proceedFlow(currentFlow, channel);
        else {
          const sourceList = await listSources();
          if (!isSourceListEmpty(sourceList)) {
            currentFlow.setSourceList(sourceList);
            await proceedFlow(currentFlow, channel, {
              messageData: sourceList,
            });
          } else {
            currentFlow.errorOrRetry();
            const errorMessage = `Il n'y a aucune source à supprimer, la liste est vide!\n${autoDestructionMessage}`;
            await sendFlowMessage(currentFlow, channel, errorMessage);
            await deleteLastMessageWithTimeout(currentFlow);
            currentFlow = undefined;
          }
        }
      } else if (isListCommand) {
        const sourceList = await listSources();
        const { embed } = getMessage(MessageTypes.LIST, sourceList);
        if (!embed) return;

        await channel.send({ embeds: [embed] });
      } else if (isHelpCommand) {
        const { embed } = getMessage(MessageTypes.HELP);
        if (!embed) return;

        await channel.send({ embeds: [embed] });
      }
    }
  }

  if (currentFlow && messageAuthor === currentFlow.initiator()) {
    if (isCancelCommand) {
      await cancelFlow(currentFlow, channel);
      currentFlow = undefined;
    } else if (
      !currentFlow.isAtInteractiveStep() &&
      currentFlow instanceof AddFlow
    ) {
      // AddFlow: Step 2 -> 3
      await deleteLastMessage(currentFlow);
      await message.delete();

      const sourceQuery = messageContent;
      const messageType = currentFlow.messageType();
      const sourceType =
        messageType === MessageTypes.ADD_INSTAGRAM
          ? SourceTypes.INSTAGRAM
          : messageType === MessageTypes.ADD_TWITTER
          ? SourceTypes.TWITTER
          : messageType === MessageTypes.ADD_YOUTUBE
          ? SourceTypes.YOUTUBE
          : SourceTypes.RSS;
      const sourceToAdd = {
        type: sourceType,
        name: sourceQuery,
        url: sourceQuery,
      };

      currentFlow.setInvolvedSource(sourceToAdd);
      await proceedFlow(currentFlow, channel, { messageData: sourceToAdd });
    }
  }
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (currentFlow && interaction.user.id === currentFlow.initiator()) {
    const channel = interaction.channel as Channel;
    if (interaction.isSelectMenu()) {
      // AddFlow/DeleteFlow: Step 1 -> 2
      const selectedValue = interaction.values[0];
      await interaction.deferUpdate();

      await deleteLastMessage(currentFlow);

      if (currentFlow instanceof AddFlow) {
        await proceedFlow(currentFlow, channel, {
          messageSubType: selectedValue,
        });
      } else {
        const sourceList = currentFlow.getSourceList();
        if (sourceList) {
          const sourceName = selectedValue.slice(
            selectedValue.indexOf("-") + 1,
            selectedValue.length
          );
          let sourceType;
          let source;
          for (const type in sourceList) {
            const sourcesByType = sourceList[type as SourceTypes];
            if (sourcesByType) {
              if (Object.keys(sourcesByType).includes(sourceName)) {
                sourceType = type;
                source = sourcesByType[sourceName];
                break;
              }
            }
          }

          if (source) {
            const sourceToDelete: Source = {
              type: sourceType as SourceTypes,
              name: sourceName,
              url: source.url,
            };

            currentFlow.setInvolvedSource(sourceToDelete);
            await proceedFlow(currentFlow, channel, {
              messageData: sourceToDelete,
            });
          }
        }
      }
    } else {
      // FIXME: for some reasons, ts doesn't seem to recognize ButtonInteraction to hold
      // the customId property. Same goes for deferUpdate().
      const isYesButtonClicked =
        (interaction as Interaction & { customId: string }).customId ===
        "confirm-yes-button";
      await (interaction as Interaction & { deferUpdate: any }).deferUpdate();

      // AddFlow: isYesButtonClicked === true ? Step 3 -> 4 : Cancel Process
      // DeleteFlow: isYesButtonClicked === true ? Step 2 -> 3 : Cancel Process
      const isAddFlow = currentFlow instanceof AddFlow;
      if (isYesButtonClicked) {
        const involvedSource = currentFlow.getInvolvedSource() as Source;
        isAddFlow
          ? await addSource(involvedSource)
          : await deleteSource(involvedSource.name);

        await deleteLastMessage(currentFlow);
        await proceedFlow(currentFlow, channel, {
          messageData: involvedSource,
        });
      } else await cancelFlow(currentFlow, channel);
      currentFlow = undefined;
    }
  }
});

client.login(process.env.TOKEN).then((res) => console.log(res));
