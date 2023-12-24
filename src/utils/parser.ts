import Parser from "rss-parser";

const URL_REGEX =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

const getRssNameFromUrl = async (url: string): Promise<string | undefined> => {
  if (!URL_REGEX.test(url)) return;
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  return feed.title || "Undefined";
};

export { getRssNameFromUrl };
