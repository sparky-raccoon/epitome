import { ColorResolvable, EmbedFieldData, MessageActionRow, MessageEmbed } from 'discord.js';
import { blockQuote, bold, inlineCode } from '@discordjs/builders';

import { AVATAR_URL, CONFIGURING_IMG_URL, ERASING_IMG_URL } from './constants';
import { MessageTypes, Source, SourceList, SourceTypes, MessageData } from './types';
import { formatSourceTypeToReadable, formatSourceListToEmbedField } from './utils/source';
import { selectSourceTypeMenu, selectSavedSourceMenu } from './components/select-menu';
import { confirmButton } from './components/confirm-button';

const autoDestructionMessage = "Ce message va s'auto-détruire dans 5..4..3..";

const getMessage = (type: MessageTypes, data?: MessageData): {
    embed?: MessageEmbed,
    component?: MessageActionRow,
} => {
    if (type === MessageTypes.NULL) return {};

    let color: ColorResolvable = '#ffffff';
    let title = '';
    let description = '';
    let fields: EmbedFieldData[] = [];
    let imageUrl = '';
    let footerText = '';
    let component;

    const sourceMockData: Source = {
        type: SourceTypes.YOUTUBE,
        name: "The Code Train",
        url: "https://youtube/channel/the-code-train",
    }

    const sourceListMockData: SourceList = {
        [SourceTypes.YOUTUBE]: {
            ["Channel A"]: {
                url: "https://youtube/channel/channel-a",
                timestamp: (new Date()).toISOString(),
            },
            ["Channel B"]: {
                url: "https://youtube/channel/channel-b",
                timestamp: (new Date()).toISOString(),
            }
        },
        [SourceTypes.INSTAGRAM]: {
            ["@account-a"]: {
                url: "https://instagram.com/account-a",
                timestamp: (new Date()).toISOString(),
            },
            ["@account-b"]: {
                url: "https://instagram.com/account-b",
                timestamp: (new Date()).toISOString(),
            }
        }
    }

    const defaultErrorMessage ="Il y a eu un pépin quelque part.";
    const cancelInfoMessage = `\nTu pourras envoyer la commande ${inlineCode('!cancel')} à tout moment pour annuler cette procédure.`;

    switch (type) {
        case MessageTypes.ADD: {
            title = "✸ Config. d'une nouvelle source de publications à suivre"
            description = `Choisis le type de publications à suivre (YouTube, Instagram, Twitter, ou un flux RSS) dans le sélecteur juste en-dessous! 👇${cancelInfoMessage}`;
            imageUrl = CONFIGURING_IMG_URL;
            footerText = 'Ajout de source';
            component = selectSourceTypeMenu;
            break;
        }
        case MessageTypes.ADD_INSTAGRAM: {
            color = '#E1306C';
            title = "✸ Ajout d'un compte Instagram dans la liste des sources suivies";
            description = `Indique sous forme de message un nom de compte existant.\nPar exemple: ${bold('@jane.doe')}`;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_RSS: {
            color = '#ee802f';
            title = "✸ Ajout d'un flux RSS dans la liste des sources suivies";
            description = `Indique sous forme de message une url valide de feed RSS.\nPar exemple: ${bold('https://www.lemonde.fr/rss/en_continu.xml')}`;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_TWITTER: {
            color = '#1DA1F2';
            title = "✸ Ajout d'un compte Twitter dans la liste des sources suivies";
            description = `Indique sous forme de message un nom de compte existant.\nPar exemple: ${bold('@jane.doe')}`;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_YOUTUBE: {
            color = '#FF0000';
            title = "✸ Ajout d'une chaîne YouTube dans la liste des sources suivies";
            description = `Indique sous forme de message une url valide de chaîne.\nPar exemple: ${bold('https://www.youtube.com/channel/xxx')}`;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_CONFIRM: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "✸ Les informations de la source de publications configurée sont-elles exactes ?";
            description = blockQuote(`Type: ${formatSourceTypeToReadable(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = 'Ajout de source';
            component = confirmButton('Oui', 'Non (Annuler)');
            break;
        }
        case MessageTypes.ADD_COMPLETE: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "✸ Une nouvelle source de publications à suivre a été ajoutée !";
            description = blockQuote(`Type: ${formatSourceTypeToReadable(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = "Ajout de source";
            break;
        }
        case MessageTypes.ADD_CANCEL: {
            title = "✸ Config. d'une nouvelle source de publications annulée";
            description = autoDestructionMessage;
            footerText = "Ajout de source";
            break;
        }
        case MessageTypes.ADD_OUPS: {
            title = "✸ Oupsie!";
            description = `${(data as string) || defaultErrorMessage}`;
            footerText = "Ajout de source";
            break;
        }
        case MessageTypes.DELETE: {
            title = "✸ Suppression d'une source de publications existante"
            description = `Choisis la source à supprimer dans le sélecteur juste en-dessous! 👇${cancelInfoMessage}`;;
            imageUrl = ERASING_IMG_URL;
            component = selectSavedSourceMenu(data as SourceList);
            footerText = 'Suppression de source';
            break;
        }
        case MessageTypes.DELETE_CONFIRM: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "✸ La source de publications a supprimer est-elle bien la suivante ?";
            description = blockQuote(`Type: ${formatSourceTypeToReadable(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = 'Suppression de source';
            component = confirmButton('Oui', 'Non (Annuler)');
            break;
        }
        case MessageTypes.DELETE_COMPLETE: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "✸ Une source de publications vient d'être supprimée !";
            description = blockQuote(`Type: ${formatSourceTypeToReadable(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = 'Suppression de source';
            break;
        }
        case MessageTypes.DELETE_CANCEL: {
            title = "✸ Suppression d'une source de publications existante annulée";
            description = autoDestructionMessage;
            footerText = "Suppression de source";
            break;
        }
        case MessageTypes.DELETE_OUPS: {
            title = "✸ Oupsie!";
            description = `${(data as string) || defaultErrorMessage}`;
            footerText = "Suppression de source";
            break;
        }
        case MessageTypes.HELP: {
            title = "✸ Hello";
            description = `Je m’appelle ${bold('@Epitome')}. Je suis une bot qui t’aidera à rester à jour vis-à-vis des réseaux sociaux, et des médias / blogs que tu suis.\n\n`
                + "Voici la liste des choses que je sais faire!\n"
                + `- Configurer une nouvelle source de publications à suivre avec la commande ${inlineCode('!add')}\n`
                + `- Supprimer une source existante avec la commande ${inlineCode('!delete')}\n`
                + `- Annuler une procédure d'ajout ou de suppression de source en cours avec la commande ${inlineCode('!cancel')}\n`
                + `- Lister toutes les sources suivies avec la commande ${inlineCode('!list')}\n`
                + `- Enfin, répondre à un petit ${inlineCode('!help')} comme ici`
            footerText = "Help";
            break;
        }
        case MessageTypes.LIST: {
            title = "✸ Liste des sources de publications suivies";
            fields = formatSourceListToEmbedField((data as SourceList) || sourceListMockData);
            footerText = "Listing";
            break;
        }
    }

    const embed: MessageEmbed = new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setFooter({ text: footerText, iconURL: AVATAR_URL })
        .setTimestamp();

    if (description)
        embed.setDescription(description);

    if (fields.length > 0)
        embed.setFields(fields)

    if (imageUrl)
        embed.setImage(imageUrl);

    let res: { embed: MessageEmbed, component?: MessageActionRow } = { embed }
    if (component)
        res = { embed, component }
    return res;
}


export { getMessage, autoDestructionMessage }