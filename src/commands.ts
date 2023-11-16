import dotenv from "dotenv";
import { SlashCommandBuilder, Routes, REST } from "discord.js";
import { Command } from "@/constants";

dotenv.config();

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

if (CLIENT_ID && GUILD_ID && TOKEN) {
  const commands = [
    new SlashCommandBuilder()
      .setName(Command.ADD)
      .setDescription("Suivre une nouvelle source de publications.")
      .addStringOption((option) =>
        option
          .setName("url")
          .setDescription("Url de la source à ajouter")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName(Command.DELETE)
      .setDescription("Supprimer une source de publications suivie."),
    new SlashCommandBuilder()
      .setName(Command.CANCEL)
      .setDescription(
        "Annuler une procédure d’ajout ou de suppression de source en cours."
      ),
    new SlashCommandBuilder()
      .setName(Command.LIST)
      .setDescription("Lister l’ensemble des sources suivies."),
    new SlashCommandBuilder()
      .setName(Command.HELP)
      .setDescription("Afficher la liste des commandes."),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => console.log(`Successfully registered application commands.`))
    .catch(console.error);
}
