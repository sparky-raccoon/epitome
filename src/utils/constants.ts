enum Command {
  ADD_SOURCE = "add-source",
  ADD_FILTER = "add-filter",
  DELETE = "delete",
  CANCEL = "cancel",
  LIST = "list",
  HELP = "help",
}

enum Message {
  HELP = "help",
  LIST = "list",
  POST = "post",
  ADD_CONFIRM = "add_confirm",
  ADD_SUCCESS_SOURCE = "add_success_source",
  ADD_SUCCESS_TAG = "add_success_tag",
  ADD_ALREADY_EXISTS = "add_already_exists",
  ADD_NO_VALID_URL = "add_no_valid_url",
  DELETE_SELECT = "delete_select",
  DELETE_CONFIRM = "delete_confirm",
  DELETE_SUCCESS_SOURCE = "delete_success_source",
  DELETE_SUCCESS_TAG = "delete_success_tag",
  DELETE_NOTHING_SAVED = "delete_nothing_saved",
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

export { Command, Message, SourceType, INTERNAL_ERROR, BUTTON_CONFIRM_ID, BUTTON_CANCEL_ID };
