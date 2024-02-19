import {
  ColorResolvable,
  EmbedBuilder,
  bold,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Message } from "@/utils/constants";
import { Source, SourceCreation } from "@/bdd/models/source";
import { Tag, TagCreation } from "@/bdd/models/tag";
import {
  Publication,
  isPublication,
  isSource,
  isTag,
  isSourceAndTagList,
  isTagList,
  isTagCreationList,
  isSourceList,
} from "@/utils/types";
import {
  formatFullListToDescription,
  formatSourceListToBlockQuotes,
  formatSourceToBlockQuote,
  formatTagListToString,
  splitDescriptionInMultipleMessages,
} from "@/utils/formatters";
import { confirmOrCancelButton } from "@/components/confirm-button";
import { FSource } from "@/bdd/collections/source";

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
  | TagCreation[]
  | Tag[]
  | Publication
  | { new: TagCreation[]; existing: Tag[] }
  | { new: FSource[]; existing: FSource[]; type: 'source' }
  | Error;
type MessageComponent = ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>;

const ADD_SOURCE_TITLE = "Ajout d’une ou plusieurs sources d'information";
const ADD_TAG_TITLE = "Ajout d’un ou de plusieurs tags / filtres";
const DELETE_SOURCE_TITLE = "Suppression d'une source ou d'un tag / filtre configuré";
const DELETE_TAG_TITLE = "Suppression d’un tag / filtre configuré";

const buildDiscordMessage = (
  isFirstEntry = true,
  messageData: {
    title: string;
    color: ColorResolvable;
    description?: string;
    imageUrl?: string;
    component?: MessageComponent;
  }
) => {
  const { title, description, color, imageUrl, component } = messageData;
  const embed: EmbedBuilder = new EmbedBuilder().setColor(color).setTitle(title);
  if (description) embed.setDescription(description);

  if (isFirstEntry) {
    if (imageUrl) embed.setImage(imageUrl);
    return component
      ? { embeds: [embed], components: [component], ephemeral: true }
      : { embeds: [embed], components: [], ephemeral: true };
  } else return { embeds: [embed], components: [], ephemeral: true };
};

// FIXME: somehow functions overloads are not working here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMessage = (type: Message, data?: MessageData): any => {
  let color: ColorResolvable = "#ffffff";
  let title = "✸ ";
  let description = "";
  const imageUrl = "";
  let component: MessageComponent | undefined;

  switch (type) {
    case Message.HELP: {
      title += "Ici Epitome";
      description =
        "Je suis un.e bot qui t’aidera à rester à jour vis à vis de certaines sources " +
        "d’information à partir de leurs flux RSS - d'autres modes de suivi seront supportés à l'avenir. " +
        "Chaque salon de ton serveur Discord dispose de sa propre configuration et peut se voir associer " +
        "des sources différentes. Les publications relatives à ces sources peuvent être filtrées " +
        "à partir d'une liste de tags choisis. \n\n" +
        "Voici la liste des commandes auxquelles je réponds :\n" +
        `▪︎ ${bold(
          "/add-source <urls>"
        )} - pour ajouter une ou plusieurs source au salon présent.\n` +
        `▪︎ ${bold("/add-filter <names>")} ` +
        `- pour ajouter un ou plusieurs tags / filtres au salon présent.\n` +
        `▪︎ ${bold(
          "/delete <nom>"
        )} - pour supprimer une source ou un tag associé au salon présent via leurs identifiants.\n` +
        `▪︎ ${bold("/cancel")} - pour annuler une procédure d’ajout ou de suppression en cours.\n` +
        `▪︎ ${bold("/list")} ` +
        `- pour lister l’ensemble des sources & tags associés à ce salon.\n` +
        `▪︎ ${bold("/help")} - pour te rappeler qui je suis, et ce que je sais faire.`;
      break;
    }
    case Message.POST: {
      if (!isPublication(data)) throw new Error("Invalid data type.");
      const {
        type,
        name,
        title: pTitle,
        link,
        contentSnippet,
        author,
        date,
        duplicateSources,
      } = data;
      title += `[${name}] ${pTitle}`;
      description =
        `${contentSnippet}\n\n` +
        `Date de publication : ${date}\n` +
        (author ? `Auteur.rice : ${author}\n` : "") +
        `Source : ${link}` +
        (duplicateSources ? `\nAussi visible sur : ${duplicateSources.join(", ")}` : "");
      color = getColorForSourceType(type);
      break;
    }
    case Message.LIST: {
      if (!isSourceAndTagList(data)) throw new Error("Invalid data type.");
      title += "Liste des sources suivies & tags configurés";
      if (data.length === 0) description = "Aucune configuration connue pour ce salon.";
      else description = formatFullListToDescription(data);
      break;
    }
    case Message.ADD_CONFIRM: {
      if (typeof data === "object" && "new" in data && "existing" in data && "type" in data) {
        const { new: toAdd, existing } = data;
        if (data.type === 'source') {
          title += ADD_SOURCE_TITLE;
          description =
            `Tu es sur le point d'ajouter les sources suivantes :\n\n` +
            formatFullListToDescription(toAdd) +
            (existing.length > 0
              ? "\nLes sources suivantes ont déjà été configurées :\n\n" +
                formatFullListToDescription(existing)
              : "");
          component = confirmOrCancelButton();
        } else if (isTagCreationList(toAdd) && isTagList(existing)) {
          title += ADD_TAG_TITLE;
          description =
            "Tu es sur le point d’ajouter les tags suivants : \n" +
            formatTagListToString(toAdd) +
            (existing.length > 0
              ? "\nLes tags suivants ont déjà configurés : " + formatTagListToString(existing)
              : "");
          component = confirmOrCancelButton();
        } else throw new Error("Invalid data type.");
      } else throw new Error("Invalid data type.");

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
      if (isSourceList(data)) {
        title += ADD_SOURCE_TITLE;
        description =
          "Il semblerait que ces sources soient déjà suivies :\n\n" +
          formatSourceListToBlockQuotes(data);
      } else if (isTagList(data)) {
        title += ADD_TAG_TITLE;
        description =
          "Il semblerait que ces tags soient déjà configurés : " + formatTagListToString(data);
      } else throw new Error("Invalid data type.");
      break;
    }
    case Message.ADD_NO_VALID_URL: {
      title += ADD_SOURCE_TITLE;
      description = "Aucune URL valide n'a été fournie.";
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
        `Pour retrouver la liste des sources de publication présentement configurées dans ce salon, appelle la commande \`/list\``;
      break;
    }
    case Message.DELETE_SUCCESS_TAG: {
      title += DELETE_TAG_TITLE + " effective";
      description =
        `Les publications ne seront plus filtrées selon ce tag. ` +
        `Pour retrouver la liste des tags présentement configurés dans ce salon, appelle la commande \`/list\``;
      break;
    }
    case Message.CANCEL: {
      title += "Procédure annulée";
      description = "Ce message s'auto-détruira dans quelques instants.";
      break;
    }
    case Message.ERROR: {
      if (typeof data !== "string") throw new Error("Invalid data type.");
      title += "Erreur";
      description = "Quelque chose ne tourne pas rond.\n" + data;
    }
  }

  const result = [];
  if (description.length > 2000) {
    splitDescriptionInMultipleMessages(description).forEach((description, i, descs) => {
      const isFirstEntry = i === 0;
      result.push(
        buildDiscordMessage(isFirstEntry, {
          title: title + ` (${i + 1} / ${descs.length})`,
          description,
          color,
          imageUrl,
          component,
        })
      );
    });
  } else result.push(buildDiscordMessage(true, { title, description, color, imageUrl, component }));
  return result;
};

export { getMessage };
