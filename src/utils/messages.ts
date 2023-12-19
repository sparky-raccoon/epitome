import { ColorResolvable, EmbedBuilder, bold } from "discord.js";
import { Message } from "@/utils/constants";
import { Source, SourceCreation } from "@/bdd/models/source";
import { Tag, TagCreation } from "@/bdd/models/tag";
import {
  Publication,
  isPublication,
  isSource,
  isSourceCreation,
  isTag,
  isTagCreation,
  isSourceAndTagList,
} from "@/utils/types";
import { formatSourceListToDescription, formatSourceToBlockQuote } from "@/utils/formatters";
import { confirmOrCancelButton } from "@/components/confirm-button";
import { selectSavedSourcesOrTagsMenu } from "@/components/select-menu";

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

type Error = string;
type MessageData =
  | Source
  | SourceCreation
  | Source[]
  | Tag
  | TagCreation
  | Tag[]
  | Publication
  | Error;

const ADD_SOURCE_TITLE = "Ajout d’une source d'information";
const ADD_TAG_TITLE = "Ajout d’un tag / filtre";
const DELETE_SOURCE_TITLE = "Suppression d'une source ou d'un tag / filtre configuré";
const DELETE_TAG_TITLE = "Suppression d’un tag / filtre configuré";
const DELETE_SOURCE_OR_TAG_TITLE = "Suppression d’une source ou d’un tag / filtre configuré";

const getMessage = (type: Message, data?: MessageData) => {
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
        `▪︎ ${bold("/add-source <url>")} - pour ajouter une nouvelle source au salon présent.\n` +
        `▪︎ ${bold("/add-filter <name>")} ` +
        `- pour ajouter un nouveau tag / filtre au salon présent.\n` +
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
      if (!isSourceAndTagList(data)) throw new Error("Invalid data type.");
      title += "Liste des sources suivies & tags configurés";
      if (data.length === 0) description = "Aucune configuration connue pour ce salon.";
      else description = formatSourceListToDescription(data);
      break;
    }
    case Message.ADD_CONFIRM: {
      if (isSourceCreation(data)) {
        title += ADD_SOURCE_TITLE;
        description =
          "Tu sur le point d’ajouter la source suivante :\n" + formatSourceToBlockQuote(data);
      } else if (isTagCreation(data)) {
        title += ADD_TAG_TITLE;
        description = `Tu es sur le point d’ajouter le tag suivant : ${bold(data.name)}`;
      } else throw new Error("Invalid data type.");
      component = confirmOrCancelButton();
      break;
    }
    case Message.ADD_SUCCESS_SOURCE: {
      title += ADD_SOURCE_TITLE + " effectif";
      description =
        `Tu retrouveras celle-ci parmi la liste des sources ` +
        `précédemment configurées pour ce salon avec la commande \`/list\``;
      break;
    }
    case Message.ADD_SUCCESS_TAG: {
      title += ADD_TAG_TITLE + " effectif";
      description =
        `Tu retrouveras celui-ci parmi la liste des tags ` +
        `précédemment configurés pour ce salon avec la commande \`/list\``;
      break;
    }
    case Message.ADD_ALREADY_EXISTS: {
      if (isSourceCreation(data)) {
        title += ADD_SOURCE_TITLE;
        description =
          "Il semblerait que cette source soit déjà suivie :\n" + formatSourceToBlockQuote(data);
      } else if (isTagCreation(data)) {
        title += ADD_TAG_TITLE;
        description = `Il semblerait que ce tag soit déjà configuré : ${bold(data.name)}`;
      } else throw new Error("Invalid data type.");
      break;
    }
    case Message.DELETE_SELECT: {
      if (!isSourceAndTagList(data)) throw new Error("Invalid data type.");
      title += DELETE_SOURCE_OR_TAG_TITLE;
      description = "Sélectionne la source que tu souhaites supprimer dans la liste ci-dessous :";
      component = selectSavedSourcesOrTagsMenu(data);
      break;
    }
    case Message.DELETE_CONFIRM: {
      if (isSource(data)) {
        title += DELETE_SOURCE_TITLE;
        description =
          "La source de publications suivante est sur le point d'être supprimée :\n" +
          formatSourceToBlockQuote(data);
      } else if (isTag(data)) {
        title += DELETE_TAG_TITLE;
        description = `Le tag suivant est sur le point d'être supprimé : ${bold(data.name)}`;
      } else throw new Error("Invalid data type.");
      component = confirmOrCancelButton();
      break;
    }
    case Message.DELETE_SUCCESS_SOURCE: {
      title += DELETE_SOURCE_TITLE + " effective";
      description =
        `Tu ne seras plus notifié.e des dernières publications associées à celle-ci. ` +
        `Pour retrouver la liste des sources de publication présentement configurées, appelle la commande \`/list\``;
      break;
    }
    case Message.DELETE_SUCCESS_TAG: {
      title += DELETE_TAG_TITLE + " effective";
      description =
        `Les publications ne seront plus filtrées selon ce tag. ` +
        `Pour retrouver la liste des tags présentement configurés, appelle la commande \`/list\``;
      break;
    }
    case Message.DELETE_NOTHING_SAVED: {
      title += DELETE_SOURCE_OR_TAG_TITLE;
      description = "Aucune source ou tag n'a été configuré pour ce salon.";
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
