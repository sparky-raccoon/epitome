enum SourceTypes {
    INSTAGRAM = 'ig',
    RSS = 'rss',
    TWITTER = 'twitter',
    YOUTUBE = 'youtube'
}

type SourceList = {
    [type in SourceTypes]: {
        [name: string]: {
            url: string;
            timestamp: string,
        };
    };
};

interface Source {
    type: SourceTypes,
    name: string,
    url: string,
    timestamp: string,
}

export { SourceTypes, Source, SourceList }