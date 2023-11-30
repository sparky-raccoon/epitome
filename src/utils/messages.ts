import { ColorResolvable, EmbedBuilder, bold } from "discord.js";
import { Message, SourceType } from "@/utils/constants";
import { Publication, Source, SourceList } from "@/utils/types";
import { formatSourceListToDescription, formatSourceToBlockQuote } from "@/utils/formatters";
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

const getMessage = (type: Message, data?: Source | SourceList | string | Publication) => {
  let color: ColorResolvable = "#ffffff";
  let title = "✸ ";
  let description = "";
  const imageUrl = "";
  let component;

  switch (type) {
    case Message.HELP: {
      title += "Ici Epitome";
      description =
        "Je suis un.e bot qui t’aidera à rester à jour vis à vis de sources " +
        "d’information telles que des journaux, des blogs et certains réseaux sociaux à partir de leurs flux RSS. " +
        "Il suffit de me dire quoi suivre, et je te retournerai les dernières publications " +
        "dans le canal Discord où j’aurai été configuré.e.\n\n" +
        "Voici la liste des commandes auxquelles je réponds :\n" +
        `▪︎ ${bold("/add <name> <url>")} - pour suivre une nouvelle source de publications.\n` +
        `▪︎ ${bold("/delete")} - pour supprimer une source de publications suivie.\n` +
        `▪︎ ${bold("/cancel")} - pour annuler une procédure d’ajout ou de suppression en cours.\n` +
        `▪︎ ${bold("/list")} - pour lister l’ensemble des sources suivies.\n` +
        `▪︎ ${bold("/help")} - pour te rappeler qui je suis, et ce que je sais faire.`;
      break;
    }
    case Message.POST: {
      const { type, name, title: pTitle, link, contentSnippet, author, date } = data as Publication;
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
      title += "Liste des sources de publications suivies";
      if (Object.keys(data as SourceList).length === 0)
        description = "Aucune source de publications n'a été configurée.";
      else description = formatSourceListToDescription(data as SourceList);
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
      title += "Ajout de la source effective";
      description = `Vous retrouverez celle-ci parmi la liste des sources précédemment configurées avec la commande ${bold(
        "/list"
      )}.`;
      break;
    }
    case Message.ADD_ALREADY_EXISTS: {
      title += "Ajout d’une source de publications";
      description =
        "Il semblerait que cette source de publications soit déjà suivie :\n" +
        formatSourceToBlockQuote(data as Source);
      break;
    }
    case Message.DELETE_SELECT: {
      title += "Suppression d’une source de publications suivie";
      description =
        "Sélectionne la source de publications que tu souhaites supprimer dans la liste ci-dessous :";
      component = selectSavedSourcesMenu(data as SourceList);
      break;
    }
    case Message.DELETE_CONFIRM: {
      title += "Suppression d’une source de publiciations suivie";
      description =
        "La source de publications suivante est sur le point d'être supprimée :\n" +
        formatSourceToBlockQuote(data as Source);
      component = confirmOrCancelButton();
      break;
    }
    case Message.DELETE_SUCCESS: {
      title += "Suppression de la source effective";
      description = `Tu ne seras plus notifié.e des dernières publications associées à celle-ci. Pour retrouver la liste des sources de publication présentement configurées, appelez la commande \`/list\``;
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
      title += "Erreur";
      description = "Quelque chose ne tourne pas rond.\n" + (data as string);
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
