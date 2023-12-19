import { ColorResolvable, EmbedBuilder, bold } from "discord.js";
import { Message } from "@/utils/constants";
import { Source, SourceCreation } from "@/bdd/models/source";
import {
  Publication,
  isPublication,
  isSource,
  isSourceCreation,
  isSourceList,
} from "@/utils/types";
import { formatSourceListToDescription, formatSourceToBlockQuote } from "@/utils/formatters";
import { confirmOrCancelButton } from "@/components/confirm-button";
import { selectSavedSourcesMenu } from "@/components/select-menu";

const getColorForSourceType = (sourceType: string): ColorResolvable => {
  switch (sourceType) {
    case "INSTAGRAM":
      return "#e1306c";
    case "TWITTER":
      return "#1da1f2";
    case "YOUTUBE":
      return "#ff0000";
    default:
      return "#ee802f";
  }
};

const getMessage = (
  type: Message,
  data?: Source | SourceCreation | Source[] | string | Publication
) => {
  let color: ColorResolvable = "#ffffff";
  let title = "✸ ";
  let description = "";
  const imageUrl = "";
  let component;

  switch (type) {
    case Message.HELP: {
      title += "Ici Epitome";
      description =
        "Je suis un.e bot qui t’aidera à rester à jour vis à vis de certaines sources " +
        "d’information à partir de leurs flux RSS - d'autres modes de suivi seront supportés à l'avenir. " +
        "Chaque salon de ton serveur Discord dispose de sa propre configuration et peut se voir associer " +
        "des sources différentes. Les publications relatives à ces sources peuvent être filtrées " +
        "à partir d'une liste de tags choisis. Ainsi, une même source peut être suivie dans plusieurs " +
        "serveurs pour des raisons différentes. \n\n" +
        "Voici la liste des commandes auxquelles je réponds :\n" +
        `▪︎ ${bold("/add <url>")} - pour ajouter une nouvelle source au salon présent.\n` +
        `▪︎ ${bold("/filter <name>")} - pour ajouter un nouveau tag / filtre au salon présent.\n` +
        `▪︎ ${bold("/delete")} - pour supprimer une source ou un tag associé au salon présent.\n` +
        `▪︎ ${bold("/cancel")} - pour annuler une procédure d’ajout ou de suppression en cours.\n` +
        `▪︎ ${bold("/list")} ` +
        `- pour lister l’ensemble des sources & tags associés à ce salon.\n` +
        `▪︎ ${bold("/help")} - pour te rappeler qui je suis, et ce que je sais faire.`;
      break;
    }
    case Message.POST: {
      if (!isPublication(data)) throw new Error("Invalid data type.");
      const { type, name, title: pTitle, link, contentSnippet, author, date } = data;
      title += `[${name}] ${pTitle}`;
      description =
        `${contentSnippet}\n\n` +
        `Date de publication : ${date}\n` +
        (author ? `Auteur.rice : ${author}\n` : "") +
        `Source : ${link}`;
      color = getColorForSourceType(type);
      break;
    }
    case Message.LIST: {
      if (!isSourceList(data)) throw new Error("Invalid data type.");
      title += "Liste des sources suivies & tags configurés";
      if (data.length === 0) description = "Aucune confguration connue pour ce salon.";
      else description = formatSourceListToDescription(data);
      break;
    }
    case Message.ADD_CONFIRM: {
      if (!isSourceCreation(data)) throw new Error("Invalid data type.");
      title += "Ajout d’une source d'information";
      description =
        "Tu sur le point d’ajouter la source suivante :\n" + formatSourceToBlockQuote(data);
      component = confirmOrCancelButton();
      break;
    }
    case Message.ADD_SUCCESS: {
      title += "Ajout de la source d'information effective";
      description =
        `Tu retrouveras celle-ci parmi la liste des sources ` +
        `précédemment configurées pour ce salon avec la commande \`/list\``;
      break;
    }
    case Message.ADD_ALREADY_EXISTS: {
      if (!isSource(data)) throw new Error("Invalid data type.");
      title += "Ajout d’une source d'information";
      description =
        "Il semblerait que cette source soit déjà suivie :\n" + formatSourceToBlockQuote(data);
      break;
    }
    case Message.DELETE_SELECT: {
      if (!isSourceList(data)) throw new Error("Invalid data type.");
      title += "Suppression d’une source d'information suivie";
      description = "Sélectionne la source que tu souhaites supprimer dans la liste ci-dessous :";
      component = selectSavedSourcesMenu(data);
      break;
    }
    case Message.DELETE_CONFIRM: {
      if (!isSource(data)) throw new Error("Invalid data type.");
      title += "Suppression d’une source d'information suivie";
      description =
        "La source de publications suivante est sur le point d'être supprimée :\n" +
        formatSourceToBlockQuote(data);
      component = confirmOrCancelButton();
      break;
    }
    case Message.DELETE_SUCCESS: {
      title += "Suppression de la source d'information effective";
      description =
        `Tu ne seras plus notifié.e des dernières publications associées à celle-ci. ` +
        `Pour retrouver la liste des sources de publication présentement configurées, appelle la commande \`/list\``;
      break;
    }
    case Message.DELETE_NO_SAVED_SOURCES: {
      title += "Suppression d’une source de publications suivie";
      description = "Aucune source de publications n'a été configurée.";
      break;
    }
    case Message.CANCEL: {
      title += "Procédure d'ajout / de mise à jour / de suppression annulée";
      description = "Ce message s'auto-détruira dans quelques instants.";
      break;
    }
    case Message.ERROR: {
      if (typeof data !== "string") throw new Error("Invalid data type.");
      title += "Erreur";
      description = "Quelque chose ne tourne pas rond.\n" + data;
    }
  }

  const embed: EmbedBuilder = new EmbedBuilder().setColor(color).setTitle(title);

  if (description) embed.setDescription(description);
  if (imageUrl) embed.setImage(imageUrl);

  return component
    ? { embeds: [embed], components: [component], ephemeral: true }
    : { embeds: [embed], components: [], ephemeral: true };
};

export { getMessage };
