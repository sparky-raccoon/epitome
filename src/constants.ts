enum Command {
  ADD = "add",
  DELETE = "delete",
  CANCEL = "cancel",
  LIST = "list",
  HELP = "help",
}

enum Message {
  HELP = "help",
  LIST = "list",
  SOURCE_UPDATE = "source_update",
  ADD_CONFIRM = "add_confirm",
  ADD_SUCCESS = "add_success",
  DELETE_SELECT = "delete_select",
  DELETE_CONFIRM = "delete_confirm",
  DELETE_SUCCESS = "delete_success",
  CANCEL = "cancel",
  ERROR = "error",
}

enum SourceType {
  INSTAGRAM = "ig",
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  RSS = "rss",
}

const INTERNAL_ERROR = "Erreur interne.";

const BUTTON_CONFIRM_ID = "confirm-yes-button";
const BUTTON_CANCEL_ID = "confirm-no-button";

export {
  Command,
  Message,
  SourceType,
  INTERNAL_ERROR,
  BUTTON_CONFIRM_ID,
  BUTTON_CANCEL_ID,
};
