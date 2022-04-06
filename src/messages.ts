import { ColorResolvable, EmbedFieldData, MessageEmbed } from 'discord.js';
import { blockQuote, bold, inlineCode } from '@discordjs/builders';

import { AVATAR_URL, CONFIGURING_IMG_URL, ERASING_IMG_URL, TAKING_NOTES_IMG_URL, OUPS_IMG_URL } from './commons';
import { MessageTypes, Source, SourceList, SourceTypes } from './types';

const getMessage = (type: MessageTypes, data?: Source | SourceList | string): MessageEmbed => {
    let color: ColorResolvable = '#ffffff';
    let title = '';
    let description = '';
    let fields: EmbedFieldData[] = [];
    let imageUrl = '';
    let footerText = '';

    const sourceMockData: Source = {
        type: SourceTypes.YOUTUBE,
        name: "The Code Train",
        url: "https://youtube/channel/the-code-train",
        timestamp: (new Date()).toISOString(),
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

    const errorMockMessage = "Il y a eu un pépin quelque part ...";
    const cancelMockMessage = "Tu as mis bien trop de temps à me répondre!";

    const formatSourceType = (type: SourceTypes): string => {
        switch (type) {
            case SourceTypes.YOUTUBE:
                return 'YouTube';
            case SourceTypes.INSTAGRAM:
                return 'Instagram';
            case SourceTypes.TWITTER:
                return 'Twitter';
            case SourceTypes.RSS:
                return 'RSS';
        }
    }

    const formatSourceList = (list: SourceList): EmbedFieldData[] => {
        return Object.keys(list).reduce((acc: EmbedFieldData[], key: string) => {
            const name = formatSourceType(key as SourceTypes);
            const sourcesByType = list[key as SourceTypes]
            const sourceNamesByType = Object.keys(sourcesByType || {});
            if (sourceNamesByType.length > 0)
                return [...acc, { name, value: sourceNamesByType.join('\n') }];
            else
                return acc;
        }, [])
    }

    switch (type) {
        case MessageTypes.ADD: {
            title = "Config. d'une nouvelle source de publications à suivre"
            description = `Choisis le type de publications à suivre (YouTube, Instagram, Twitter, ou un flux RSS) dans le sélecteur juste en-dessous ! 👇\nTu pourras envoyer la commande ${bold('!cancel')} à tout moment pour annuler cette procédure.`;
            imageUrl = CONFIGURING_IMG_URL;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_CONFIRM: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "Les informations de la source de publications configurée sont-elles exactes ?";
            description = blockQuote(`Type: ${formatSourceType(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_INSTAGRAM: {
            color = '#E1306C';
            title = "Ajout d'un compte Instagram dans la liste des sources suivies";
            description = `Indique sous forme de message un nom de compte existant.\nPar exemple: ${bold('@jane.doe')}`;
            imageUrl = TAKING_NOTES_IMG_URL;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_RSS: {
            color = '#ee802f';
            title = "Ajout d'un flux RSS dans la liste des sources suivies";
            description = `Indique sous forme de message une url valide de feed RSS.\nPar exemple: ${bold('https://www.lemonde.fr/rss/en_continu.xml')}`;
            imageUrl = TAKING_NOTES_IMG_URL;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_TWITTER: {
            color = '#1DA1F2';
            title = "Ajout d'un compte Twitter dans la liste des sources suivies";
            description = `Indique sous forme de message un nom de compte existant.\nPar exemple: ${bold('@jane.doe')}`;
            imageUrl = TAKING_NOTES_IMG_URL;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_YOUTUBE: {
            color = '#FF0000';
            title = "Ajout d'une chaîne YouTube dans la liste des sources suivies";
            description = `Indique sous forme de message une url valide de chaîne.\nPar exemple: ${bold('https://www.youtube.com/channel/xxx')}`;
            imageUrl = TAKING_NOTES_IMG_URL;
            footerText = 'Ajout de source';
            break;
        }
        case MessageTypes.ADD_COMPLETE: {
            title = "Done! ✨";
            footerText = "Ajout de source";
            break;
        }
        case MessageTypes.ADD_CANCEL: {
            title = "Procédure de config. d'une nouvelle source de publications annulée";
            description = `${(data as string) || cancelMockMessage}`
            footerText = "Ajout de source";
            break;
        }
        case MessageTypes.DELETE: {
            title = "Suppression d'une source suivie de publications"
            description = "Indique le nom de la source à supprimer (nom de compte, de chaîne ou de flux RSS).\nPour rappel voici la liste des sources présentement configurées. 👇";
            fields = formatSourceList((data as SourceList) || sourceListMockData);
            imageUrl = ERASING_IMG_URL;
            footerText = 'Suppression de source';
            break;
        }
        case MessageTypes.DELETE_CONFIRM: {
            const { type, name, url } = (data as Source) || sourceMockData;
            title = "La source de publications a supprimer est-elle bien la suivante ?";
            description = blockQuote(`Type: ${formatSourceType(type)}\nChaîne: ${name}\nUrl: ${url}`);
            footerText = 'Suppression de source';
            break;
        }
        case MessageTypes.DELETE_COMPLETE: {
            title = "Done! ✨";
            footerText = 'Suppression de source';
            break;
        }
        case MessageTypes.DELETE_CANCEL: {
            title = "Procédure de suppression. d'une source de publications existante annulée";
            description = `${(data as string) || cancelMockMessage}`
            footerText = "Suppression de source";
            break;
        }
        case MessageTypes.HELP: {
            title = "Hello ✨";
            description = `Je m’appelle ${bold('@Epitome')}. Je suis un petit bot qui t’aidera à rester à jour vis-à-vis des réseaux sociaux, et des médias / blogs que tu suis.\n\n`
                + "Voici une petite liste de ce que je sais faire !\n"
                + `- Configurer une nouvelle source à suivre avec la commande ${inlineCode('!add')}\n`
                + `- Supprimer une source suivie avec la commande ${inlineCode('!delete')}\n`
                + `- Lister toutes les sources suivies avec la commande ${inlineCode('!list')}\n`
                + `- Enfin, répondre à un petit ${inlineCode('!help')} comme maintenant.`
            footerText = "Help";
            break;
        }
        case MessageTypes.LIST: {
            title = "Liste des sources de publications configurées";
            fields = formatSourceList((data as SourceList) || sourceListMockData);
            footerText = "Listing";
            break;
        }
        case MessageTypes.OUPS: {
            title = "Oups! Quelque chose a mal tourné.";
            description = `${(data as string) || errorMockMessage}`;
            imageUrl = OUPS_IMG_URL;
            footerText = "Aïe aïe aïe";
            break;
        }
    }

    const messageEmbed: MessageEmbed = new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setFooter({ text: footerText, iconURL: AVATAR_URL })
        .setTimestamp();

    if (description)
        messageEmbed.setDescription(description);

    if (fields.length > 0)
        messageEmbed.setFields(fields)

    if (imageUrl)
        messageEmbed.setImage(imageUrl);

    return messageEmbed;
}


export { getMessage }