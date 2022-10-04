import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

import { CommandTypes, MessageTypes } from "./types";
import { getMessage } from "./messages";

dotenv.config();

const client = new Client({
  intents: [ GatewayIntentBits.Guilds ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  switch(commandName) {
    case CommandTypes.ADD:
      // TODO: reply with ADD_CONFIRM if url is valid.
      // Otherwise, send ERROR.
      await interaction.reply(getMessage(MessageTypes.ADD_CONFIRM));
      break;
    case CommandTypes.DELETE:
      // TODO: check if source list isn't empty, if so reply with DELETE.
      // Otherwise send ERROR.
      await interaction.reply(getMessage(MessageTypes.DELETE));
      break;
    case CommandTypes.CANCEL:
      // TODO: check if a process is ongoing, cancel and reply with CANCEL.
      // Otherwise, send ERROR.
      await interaction.reply(getMessage(MessageTypes.CANCEL));
      break;
    case CommandTypes.LIST:
      // TODO: check if source list isn't empty, if so reply with LIST.
      // Otherwise send ERROR.
      await interaction.reply(getMessage(MessageTypes.LIST));
      break;
    case CommandTypes.HELP:
      await interaction.reply(getMessage(MessageTypes.HELP));
      break;
  }
})

client.login(process.env.TOKEN).then((res) => console.log(res));
