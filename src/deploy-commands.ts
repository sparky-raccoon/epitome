import * as dotenv from "dotenv";
import { SlashCommandBuilder, Routes, REST } from "discord.js";
import { Command } from "@/utils/constants";
import logger from "@/utils/logger";

dotenv.config();
const { TOKEN: token, CLIENT_ID: clientId } = process.env;

if (!token || !clientId) throw new Error("Missing environment variables");

const commands = [
  new SlashCommandBuilder()
    .setName(Command.ADD)
    .setDescription("Suivre une nouvelle source de publications.")
    .addStringOption((option) =>
      option.setName("url").setDescription("Url de la source à ajouter").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(Command.DELETE)
    .setDescription("Supprimer une source de publications suivie."),
  new SlashCommandBuilder()
    .setName(Command.CANCEL)
    .setDescription("Annuler une procédure d’ajout ou de suppression de source en cours."),
  new SlashCommandBuilder()
    .setName(Command.LIST)
    .setDescription("Lister l’ensemble des sources suivies."),
  new SlashCommandBuilder()
    .setName(Command.HELP)
    .setDescription("Afficher la liste des commandes."),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);
rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => {
    logger.info(`Successfully registered application commands.`);
  })
  .catch((err) => {
    logger.error(`An error occurred while registering application commands: ${err.message}`);
  });
