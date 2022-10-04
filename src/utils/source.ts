import { access, readFile, writeFile } from "fs";
import path from "path";
import { APIEmbedField } from "discord.js";
import { Source, SourceList, SourceTypes } from "../types";
import {blockQuote} from '@discordjs/builders';

const DATA_FILE_PATH = path.resolve(__dirname, "../sources.json");

const updateDataFile = (data: SourceList): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), (error) => {
      if (error) reject(error);
      resolve();
    });
  });
};

const addSource = async (newData: Source): Promise<void> => {
  console.log("addSource", newData);
  const { type, name, url } = newData;
  return new Promise<void>((resolve, reject) => {
    access(DATA_FILE_PATH, (err) => {
      const timestamp = new Date().toISOString();
      // FIXME: there might be other kind of errors here than 'file not found'.
      if (err) {
        writeFile(
          DATA_FILE_PATH,
          JSON.stringify({ [type]: { [name]: { url, timestamp } } }, null, 2),
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
              [name]: { url, timestamp },
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
  console.log("deleteSource", { sourceName });
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
}

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

export {
  addSource,
  deleteSource,
  listSources,
  formatSourceTypeToReadable,
  formatSourceToBlockQuote,
  formatSourceListToEmbedField,
  isSourceListEmpty,
};
