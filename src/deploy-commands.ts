import * as dotenv from "dotenv";
import { SlashCommandBuilder, Routes, REST } from "discord.js";
import { Command } from "@/utils/constants";
import logger from "@/utils/logger";

dotenv.config();
const { NODE_ENV, TOKEN, TOKEN_DEV, CLIENT_ID, CLIENT_ID_DEV } = process.env;
const token = NODE_ENV === "development" ? TOKEN_DEV : TOKEN;
const clientId = NODE_ENV === "development" ? CLIENT_ID_DEV : CLIENT_ID;

if (!token || !clientId) throw new Error("Missing environment variables");

const commands = [
  new SlashCommandBuilder()
    .setName(Command.ADD_SOURCE)
    .setDescription("Ajouter une ou plusieurs sources d'information au salon présent.")
    .addStringOption((option) =>
      option.setName("urls").setDescription("Urls de la source à ajouter").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(Command.ADD_FILTER)
    .setDescription(
      "Ajouter un ou plusieurs tags / filtres au salon présent, séparés par un espace."
    )
    .addStringOption((option) =>
      option.setName("names").setDescription("Noms des tags à ajouter").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(Command.DELETE)
    .setDescription("Supprimer une source suivie ou un tag / filtre configuré dans ce salon.")
    .addStringOption((option) =>
      option
        .setName("nom")
        .setDescription("Nom de la source ou du tag à supprimer")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(Command.CANCEL)
    .setDescription("Annuler une procédure d’ajout ou de suppression en cours."),
  new SlashCommandBuilder()
    .setName(Command.LIST)
    .setDescription("Lister l’ensemble des sources et tags associés au salon présent."),
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
