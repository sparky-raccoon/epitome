import axios from "axios";
import { open, close, access, readFile, writeFile } from "fs";
import path from "path";
import { APIEmbedField, blockQuote } from "discord.js";
import { SourceType } from "@/constants";
import { Source, SourceList } from "@/types";

const DATA_FILE_PATH = path.resolve(__dirname, "../sources.json");

const updateDataFile = (data: SourceList): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), (error) => {
      if (error) reject(error);
      resolve();
    });
  });
};

const addSource = async ({ source }: { source: Source }): Promise<void> => {
  const { id, type, name, url, feed } = source;
  return new Promise<void>((resolve, reject) => {
    access(DATA_FILE_PATH, (err) => {
      const timestamp = new Date().toISOString();
      // FIXME: there might be other kind of errors here than 'file not found'.
      if (err) {
        writeFile(
          DATA_FILE_PATH,
          JSON.stringify(
            { [type]: { [name]: { id, url, timestamp, feed } } },
            null,
            2
          ),
          (error) => {
            if (error) reject(error);
            resolve();
          }
        );
      } else {
        readFile(DATA_FILE_PATH, "utf8", async (error, data) => {
          if (error) reject(error);

          const parsedData = JSON.parse(data);
          const newData = {
            ...parsedData,
            [type]: {
              ...parsedData[type],
              [name]: { id, url, timestamp, feed },
            },
          };

          try {
            await updateDataFile(newData);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    });
  });
};

const deleteSource = (sourceName: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    readFile(DATA_FILE_PATH, "utf8", async (error, data) => {
      if (error) reject(error);

      const parsedData = JSON.parse(data);
      for (const sourceType in parsedData) {
        if (Object.keys(parsedData[sourceType]).includes(sourceName)) {
          delete parsedData[sourceType][sourceName];
          break;
        } else {
          // Rare case where 2 different users are in a delete process to withdraw the
          // same source, one of them being faster.
          reject(
            "Cette source de publications a déjà été supprimée. Quelqu'un.e vous a devancé.e!"
          );
        }
      }

      try {
        await updateDataFile(parsedData);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
};

const listSources = async (): Promise<SourceList> => {
  return new Promise<SourceList>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) {
        if (openError.code === "ENOENT") return resolve({});
        else return reject(openError);
      }

      readFile(DATA_FILE_PATH, "utf8", (readError, data) => {
        if (readError) return reject(readError);

        close(fileHandler, (closeError) => {
          if (closeError) console.error(closeError);
          return resolve(JSON.parse(data));
        });
      });
    });
  });
};

const formatSourceTypeToReadable = (type: SourceType): string => {
  switch (type) {
    case SourceType.YOUTUBE:
      return "YouTube";
    case SourceType.INSTAGRAM:
      return "Instagram";
    case SourceType.TWITTER:
      return "Twitter";
    case SourceType.RSS:
      return "RSS";
  }
};

const formatSourceToBlockQuote = (source: Source): `>>> ${string}` => {
  const { type, name, url } = source;

  return blockQuote(
    `Type : ${formatSourceTypeToReadable(type)}\n` +
      `Chaîne : ${name}\n` +
      `Url : ${url}`
  );
};

const formatSourceListToEmbedField = (list: SourceList): APIEmbedField[] => {
  return Object.keys(list).reduce((acc: APIEmbedField[], key: string) => {
    const name = formatSourceTypeToReadable(key as SourceType);
    const sourcesByType = list[key as SourceType];
    const sourceNamesByType = Object.keys(sourcesByType || {});
    if (sourceNamesByType.length > 0)
      return [...acc, { name, value: sourceNamesByType.join("\n") }];
    else return acc;
  }, []);
};

const formatYouTubeChannelToSource = (
  channelData: any,
  url: string
): Source => {
  // FIXME: youtube channel data should be typed.
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { channelId: id, title: name } = channelData?.snippet;

  return {
    id,
    type: SourceType.YOUTUBE,
    name,
    url,
    feed: `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
  };
};

const formatTwitterUserFeedToSource = (
  twitterData: any,
  url: string
): Source => {
  // FIXME: youtube channel data should be typed.
  const { id, name } = twitterData;

  return {
    id,
    type: SourceType.TWITTER,
    name,
    url,
  };
};

const youTubeChannelUrlFormat =
  /https:\/\/www\.youtube\.com\/(c\/){0,1}([\w-]+)/;
const twitterUrlFormat = /https:\/\/twitter\.com\/(\w+)/;
const instagramUrlFormat = /https:\/\/www\.instagram\.com\/(\w+)/;

const youTubeApiBaseUrl = "https://www.googleapis.com/youtube/v3";
const twitterApiBaseUrl = "https://api.twitter.com";

const axiosOptions = { validateStatus: (status: number) => status === 200 };

const getSourceFromUrl = ({ url }: { url: string }): Promise<Source | void> => {
  // FIXME :
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Source | void>(async (resolve, reject) => {
    if (youTubeChannelUrlFormat.test(url)) {
      // Should result in [ youtube.com/c/something, c/, something ] OR
      // [ youtube.com/something, undefined, something ].
      const matches = youTubeChannelUrlFormat.exec(url);
      if (matches?.length && matches[2]) {
        try {
          const channelUrlName = matches[2];
          const { data } = await axios.get(
            `${youTubeApiBaseUrl}/search?part=snippet&q=${channelUrlName}&type=channel&key=${process.env.YOUTUBE_API_KEY}`,
            axiosOptions
          );

          if (data.items?.[0]) {
            // FIXME: sometimes channelUrlName != channelName, depending on how
            // channels arer configured. Consequently, search results might be irrelevant. For now,
            // we can't rely on other solutions than this one, or parse the entire page to
            // retrieve the source info (most importantly, the channelID).
            const channelData = data.items[0];
            resolve(formatYouTubeChannelToSource(channelData, url));
          } else {
            reject(
              "Aucune chaîne YouTube n'a pu être trouvée à partir de cette url."
            );
          }
        } catch (err) {
          reject(err);
        }
      } else reject();
    } else if (twitterUrlFormat.test(url)) {
      const matches = twitterUrlFormat.exec(url);
      if (matches?.length && matches[1]) {
        try {
          const userName = matches[1];
          const { data } = await axios.get(
            `${twitterApiBaseUrl}/2/users/by/username/${userName}`,
            {
              ...axiosOptions,
              headers: { Authorization: `Bearer ${process.env.TWITTER_TOKEN}` },
            }
          );
          if (data.data) {
            const twitterData = data.data;
            // FIXME: still need elevated access to call status/user_timeline later.
            // Check developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
            resolve(formatTwitterUserFeedToSource(twitterData, url));
          } else {
            reject(
              "Aucun compte Twitter n'a pu être trouvé à partir de cette url."
            );
          }
        } catch (err) {
          reject(err);
        }
      } else reject();
    } else if (instagramUrlFormat.test(url)) {
      reject("Route non implémentée.");
    } else {
      reject("Route non implémentée.");
    }
  });
};

export {
  addSource,
  deleteSource,
  listSources,
  formatSourceTypeToReadable,
  formatSourceToBlockQuote,
  formatSourceListToEmbedField,
  formatYouTubeChannelToSource,
  getSourceFromUrl,
};
