enum MessageTypes {
    NULL = '',
    ADD = 'add',
    ADD_COMPLETE = 'add-complete',
    ADD_CONFIRM = 'add-confirm',
    ADD_OUPS = 'add-oups',
    ADD_CANCEL = 'add-cancel',
    ADD_INSTAGRAM = 'add-ig',
    ADD_RSS = 'add-rss',
    ADD_TWITTER = 'add-twitter',
    ADD_YOUTUBE = 'add-youtube',
    DELETE = 'delete',
    DELETE_COMPLETE = 'delete-complete',
    DELETE_CONFIRM = 'delete-confirm',
    DELETE_OUPS = 'delete-oups',
    DELETE_CANCEL = 'delete-cancel',
    LIST = 'list',
    HELP = 'help',
}

type MessageData = string | Source | SourceList;

enum SourceTypes {
    INSTAGRAM = 'ig',
    RSS = 'rss',
    TWITTER = 'twitter',
    YOUTUBE = 'youtube'
}

type SourceList = {
    [type in SourceTypes]?: {
        [name: string]: {
            url: string;
            timestamp: string,
        }
    }
};

interface Source {
    type: SourceTypes,
    name: string,
    url: string,
}

export { MessageTypes, SourceTypes, Source, SourceList, MessageData }