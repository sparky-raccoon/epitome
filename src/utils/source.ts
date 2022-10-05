import axios from "axios";
import { access, readFile, writeFile } from "fs";
import path from "path";
import { APIEmbedField } from "discord.js";
import { Source, SourceList, SourceTypes } from "../types";
import { blockQuote } from "@discordjs/builders";

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
  const { id, type, name, url } = source;
  return new Promise<void>((resolve, reject) => {
    access(DATA_FILE_PATH, (err) => {
      const timestamp = new Date().toISOString();
      // FIXME: there might be other kind of errors here than 'file not found'.
      if (err) {
        writeFile(
          DATA_FILE_PATH,
          JSON.stringify(
            { [type]: { [name]: { id, url, timestamp } } },
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
              [name]: { id, url, timestamp },
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

const listSources = (): Promise<SourceList> => {
  return new Promise<SourceList>((resolve, reject) => {
    readFile(DATA_FILE_PATH, "utf8", async (error, data) => {
      if (error) reject(error);
      resolve(JSON.parse(data));
    });
  });
};

const isSourceListEmpty = (sourceList: SourceList): boolean => {
  let isEmpty = true;
  for (const sourceType in sourceList) {
    for (const sourceObject in sourceList[sourceType as SourceTypes]) {
      if (sourceObject) {
        isEmpty = false;
        break;
      }
    }
  }
  return isEmpty;
};

const formatSourceTypeToReadable = (type: SourceTypes): string => {
  switch (type) {
    case SourceTypes.YOUTUBE:
      return "YouTube";
    case SourceTypes.INSTAGRAM:
      return "Instagram";
    case SourceTypes.TWITTER:
      return "Twitter";
    case SourceTypes.RSS:
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
    const name = formatSourceTypeToReadable(key as SourceTypes);
    const sourcesByType = list[key as SourceTypes];
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
    type: SourceTypes.YOUTUBE,
    name,
    url,
  };
};

const youTubeChannelUrlFormat = /youtube\.com\/(c\/{0,1})(\w+)/;
const twitterUrlFormat = /twitter\.com\/(\w+)/;
const instagramUrlFormat = /www\.instagram\.com\/(\w+)/;

const youTubeApiBaseUrl = "https://www.googleapis.com/youtube/v3";
const axiosOptions = { validateStatus: (status: number) => status === 200 };

const getSourceFromUrl = ({ url }: { url: string }): Promise<Source | void> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Source | void>(async (resolve, reject) => {
    if (youTubeChannelUrlFormat.test(url)) {
      // Should result in [ youtube.com/c/something, c/, something ] OR
      // [ youtube.com/somthing, undefined, something ].
      const matches = youTubeChannelUrlFormat.exec(url);
      if (matches?.length && matches[2]) {
        try {
          const channelUrlName = matches[2];
          const { data } = await axios.get(
            `${youTubeApiBaseUrl}/search?part=snippet&q=${channelUrlName}&type=channel&key=${process.env.YOUTUBE_API_KEY}`,
            axiosOptions
          );
          const channelData = data.items[0];

          console.log("Url: ", url);
          console.log("ChannelUrlName: ", channelUrlName);
          console.log("YouTube Lookup Results: ", data.items);
          console.log("Channel Found: ", channelData);

          if (channelData) {
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
      reject("Route non implémentée.");
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
  isSourceListEmpty,
  getSourceFromUrl,
};
