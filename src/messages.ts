import {
  ColorResolvable,
  EmbedBuilder,
  APIEmbedField,
  blockQuote,
  bold,
} from "discord.js";

import {
  MessageData,
  MessageTypes,
  Source,
  SourceList,
  SourceTypes,
} from "./types";
import {
  formatSourceListToEmbedField,
  formatSourceTypeToReadable,
  formatSourceToBlockQuote,
} from "./utils/source";
import { confirmOrCancelButton } from "./components/confirm-button";
import { selectSavedSourcesMenu } from "./components/select-menu";

const autoDestructionMessage =
  "Ce message s’auto-détruira dans quelques instants.";

const SourceColors: { [key in SourceTypes]: ColorResolvable } = {
  [SourceTypes.INSTAGRAM]: "#e1306c",
  [SourceTypes.TWITTER]: "#1da1f2",
  [SourceTypes.YOUTUBE]: "#ff0000",
  [SourceTypes.RSS]: "#ee802f",
};

const getMessage = (type: MessageTypes, data?: MessageData) => {
  let color: ColorResolvable = "#ffffff";
  let title = "✸ ";
  let description = "";
  let fields: APIEmbedField[] | [APIEmbedField[]] = [];
  const imageUrl = "";
  let component;

  switch (type) {
    case MessageTypes.HELP: {
      title += "Ici Epitome";
      description =
        "Je suis un.e bot qui t’aidera à rester à jour vis à vis de sources d’informations telles que les journaux en ligne, les blogs et les réseaux sociaux. Il suffit de me dire quoi suivre, et je te retournerai les dernières publications dans le canal Discord où j’aurai été configuré.e.\n" +
        "\n" +
        "Voici la liste des commandes auxquelles je réponds :\n" +
        `▪︎ ${bold(
          "/add <url>"
        )} pour suivre une nouvelle source de publications \n` +
        `▪︎ ${bold(
          "/delete"
        )} - pour supprimer une source de publications suivie \n` +
        `▪︎ ${bold(
          "/cancel"
        )} - pour annuler une procédure d’ajout ou de suppression en cours \n` +
        `▪︎ ${bold("/list")} - pour lister l’ensemble des sources suivies\n` +
        `︎︎▪︎ ${bold(
          "/help"
        )} - pour te rappeler qui je suis, et ce que je sais faire`;
      break;
    }
    case MessageTypes.INSTAGRAM_NEWS:
    case MessageTypes.TWITTER_NEWS:
    case MessageTypes.YOUTUBE_NEWS:
    case MessageTypes.RSS_NEWS: {
      const { type: sourceType, name: sourceName } = data as Source;
      title += `${formatSourceTypeToReadable(
        sourceType
      )} Nouvelle publication de ${sourceName}`;
      color = SourceColors[sourceType];
      break;
    }
    case MessageTypes.LIST: {
      title += "Liste configurée des sources de publications";
      fields = formatSourceListToEmbedField(data as SourceList);
      break;
    }
    case MessageTypes.ADD_CONFIRM: {
      title += "Ajout d’une source de publications";
      description =
        "Vous êtes sur le point d’ajouter la source de publications suivante :\n" +
        formatSourceToBlockQuote(data as Source);
      component = confirmOrCancelButton();
      break;
    }
    case MessageTypes.ADD_SUCCESS: {
      title += "Votre source a bien été ajoutée";
      description =
        `Vous retrouverez celle-ci parmi la liste des sources précédemment configurées avec la commande ${bold(
          "!list"
        )}\n` +
        "Toute nouvelle publication sera partagée dans le canal Discord présent.\n" +
        "\n" +
        autoDestructionMessage;
      break;
    }
    case MessageTypes.DELETE: {
      title += "Suppression d’une source de publications suivie";
      description =
        "Veuillez sélectionner la source à supprimer dans la liste ci-dessous :";
      component = selectSavedSourcesMenu(data as SourceList);
      break;
    }
    case MessageTypes.DELETE_CONFIRM: {
      title += "Suppression d’une source de publiciations suivie";
      description =
        "Vous êtes sur le point de supprimer la source de publications suivante :\n" +
        formatSourceToBlockQuote(data as Source);
      component = confirmOrCancelButton();
      break;
    }
    case MessageTypes.DELETE_SUCCESS: {
      title += "Votre source a bien été supprimée";
      description =
        `Vous ne serez plus notifié.es des dernières publications associées à celle-ci. Pour retrouver la liste des sources de publication présentement configurées, appelez la commande ${blockQuote(
          "!list"
        )}.\n` +
        "\n" +
        autoDestructionMessage;
      break;
    }
    case MessageTypes.CANCEL: {
      title += "Procédure d’ajout / de suppression annulée";
      description = autoDestructionMessage;
      break;
    }
    case MessageTypes.ERROR: {
      title += "Erreur !";
      const reason = data ? `Raison : “${data as string}"\n` : "";
      description =
        "Quelque chose ne tourne pas rond.\n" +
        reason +
        "\n" +
        autoDestructionMessage;
    }
  }

  const embed: EmbedBuilder = new EmbedBuilder()
    .setColor(color)
    .setTitle(title);

  if (description) embed.setDescription(description);
  if (fields.length > 0) embed.setFields(fields);
  if (imageUrl) embed.setImage(imageUrl);

  if (component) {
    return { embeds: [embed], components: [component], ephemeral: true };
  } else {
    return { embeds: [embed], ephemeral: true };
  }
};

export { getMessage, autoDestructionMessage };
