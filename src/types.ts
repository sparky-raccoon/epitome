import { ChatInputCommandInteraction } from "discord.js";

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

type MessageData = string | Source | SourceList;

enum SourceTypes {
  INSTAGRAM = "ig",
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  RSS = "rss",
}

type SourceList = {
  [type in SourceTypes]?: {
    [name: string]: {
      id: string;
      url: string;
      timestamp: string;
    };
  };
};

type Source = {
  id: string;
  type: SourceTypes;
  name: string;
  url: string;
};

type FlowData = {
  userId: string;
  interaction: ChatInputCommandInteraction;
  cleanup: (userId: string) => void;
};

type AddMachineContext = FlowData & {
  url: string;
  source?: Source;
  error?: string;
};

type DeleteMachineContext = FlowData & {
  source?: Source;
  error?: string;
};

type ListMachineContext = FlowData & {
  sourceList?: SourceList;
  error?: string;
};

export {
  SourceTypes,
  CommandTypes,
  MessageTypes,
  SourceList,
  Source,
  MessageData,
  FlowData,
  AddMachineContext,
  DeleteMachineContext,
  ListMachineContext,
};
