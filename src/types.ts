enum MessageTypes {
    ADD = 'add',
    ADD_COMPLETE = 'add-complete',
    ADD_CONFIRM = 'add-confirm',
    ADD_INSTAGRAM = 'add-ig',
    ADD_RSS = 'add-rss',
    ADD_TWITTER = 'add-twitter',
    ADD_YOUTUBE = 'add-youtube',
    ADD_CANCEL = 'add-cancel',
    DELETE = 'delete',
    DELETE_COMPLETE = 'delete-complete',
    DELETE_CANCEL = 'delete-cancel',
    OUPS = 'oups',
    LIST = 'list',
    HELP = 'help',
}

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
    timestamp: string,
}

export { MessageTypes, SourceTypes, Source, SourceList }