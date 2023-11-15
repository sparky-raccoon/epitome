import {
  ColorResolvable,
  EmbedBuilder,
  APIEmbedField,
  blockQuote,
  bold,
} from "discord.js";
import { Message, SourceType } from "@/constants";
import { Source, SourceList } from "@/types";
import {
  formatSourceListToEmbedField,
  formatSourceTypeToReadable,
  formatSourceToBlockQuote,
} from "@/utils/formatters";
import { confirmOrCancelButton } from "@/components/confirm-button";
import { selectSavedSourcesMenu } from "@/components/select-menu";

const getColorForSourceType = (sourceType: SourceType): ColorResolvable => {
  switch (sourceType) {
    case SourceType.INSTAGRAM:
      return "#e1306c";
    case SourceType.TWITTER:
      return "#1da1f2";
    case SourceType.YOUTUBE:
      return "#ff0000";
    case SourceType.RSS:
      return "#ee802f";
  }
};

const getMessage = (type: Message, data?: Source | SourceList | string) => {
  let color: ColorResolvable = "#ffffff";
  let title = "✸ ";
  let description = "";
  let fields: APIEmbedField[] | [APIEmbedField[]] = [];
  const imageUrl = "";
  let component;

  switch (type) {
    case Message.HELP: {
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
    case Message.SOURCE_UPDATE: {
      const { type: sourceType, name: sourceName } = data as Source;
      title += `${formatSourceTypeToReadable(
        sourceType
      )} Nouvelle publication de ${sourceName}`;
      color = getColorForSourceType(sourceType);
      break;
    }
    case Message.LIST: {
      title += "Liste des sources de publications suivies";
      if (Object.keys(data as SourceList).length === 0)
        description = "Aucune source de publications configurée.";
      else fields = formatSourceListToEmbedField(data as SourceList);
      break;
    }
    case Message.ADD_CONFIRM: {
      title += "Ajout d’une source de publications";
      description =
        "Vous êtes sur le point d’ajouter la source de publications suivante :\n" +
        formatSourceToBlockQuote(data as Source);
      component = confirmOrCancelButton();
      break;
    }
    case Message.ADD_SUCCESS: {
      title += "Votre source a bien été ajoutée";
      description =
        `Vous retrouverez celle-ci parmi la liste des sources précédemment configurées avec la commande ${bold(
          "/list"
        )}\n` +
        "Toute nouvelle publication sera partagée dans le canal Discord présent.\n";
      break;
    }
    case Message.DELETE_SELECT: {
      title += "Suppression d’une source de publications suivie";
      description =
        "Veuillez sélectionner la source à supprimer dans la liste ci-dessous :";
      component = selectSavedSourcesMenu(data as SourceList);
      break;
    }
    case Message.DELETE_CONFIRM: {
      title += "Suppression d’une source de publiciations suivie";
      description =
        "Vous êtes sur le point de supprimer la source de publications suivante :\n" +
        formatSourceToBlockQuote(data as Source);
      component = confirmOrCancelButton();
      break;
    }
    case Message.DELETE_SUCCESS: {
      title += "Votre source a bien été supprimée";
      description = `Vous ne serez plus notifié.es des dernières publications associées à celle-ci. Pour retrouver la liste des sources de publication présentement configurées, appelez la commande ${blockQuote(
        "/list"
      )}.`;
      break;
    }
    case Message.CANCEL: {
      title += "Procédure annulée";
      break;
    }
    case Message.ERROR: {
      title += "Erreur !";
      const reason = data ? `Raison : “${data as string}"\n` : "";
      description = "Quelque chose ne tourne pas rond.\n" + reason;
    }
  }

  const embed: EmbedBuilder = new EmbedBuilder()
    .setColor(color)
    .setTitle(title);

  if (description) embed.setDescription(description);
  if (fields.length > 0) embed.setFields(fields);
  if (imageUrl) embed.setImage(imageUrl);

  return component
    ? { embeds: [embed], components: [component], ephemeral: true }
    : { embeds: [embed], ephemeral: true };
};

export { getMessage };
