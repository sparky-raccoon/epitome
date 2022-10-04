enum SourceTypes {
  INSTAGRAM = "ig",
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  RSS = "rss",
}

enum CommandTypes {
  ADD = "add",
  DELETE = "delete",
  CANCEL = "cancel",
  LIST = "list",
  HELP = "help",
 }

enum MessageTypes {
  HELP = "help",
  LIST = "list",
  INSTAGRAM_NEWS = "ig_news",
  TWITTER_NEWS = "twitter_news",
  YOUTUBE_NEWS = "youtube_news",
  RSS_NEWS = "rss_news",
  ADD_CONFIRM = "add",
  ADD_SUCCESS = "add_success",
  DELETE = "delete",
  DELETE_CONFIRM = "delete_confirm",
  DELETE_SUCCESS = "delete_success",
  CANCEL = "cancel",
  ERROR = "error",
}

type SourceList = {
  [type in SourceTypes]?: {
    [name: string]: {
      url: string;
      timestamp: string;
    };
  };
};

type Source = {
  type: SourceTypes;
  name: string;
  url: string;
};

type MessageData = string | Source | SourceList;

export { SourceTypes, CommandTypes, MessageTypes, SourceList, Source, MessageData };
