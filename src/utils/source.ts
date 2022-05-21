import { access, readFile, writeFile } from "fs";
import path from "path";
import { EmbedFieldData } from "discord.js";
import { Source, SourceList, SourceTypes } from "../types";

const DATA_FILE_PATH = path.resolve(__dirname, "../sources.json");

const updateDataFile = (data: SourceList): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), (error) => {
      if (error) reject(error);
      resolve();
    });
  });
};

const addSource = async (newData: Source): Promise<void> => {
  console.log("addSource", newData);
  const { type, name, url } = newData;
  return new Promise((resolve, reject) => {
    access(DATA_FILE_PATH, (err) => {
      const timestamp = new Date().toISOString();
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
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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

const formatSourceListToEmbedField = (list: SourceList): EmbedFieldData[] => {
  return Object.keys(list).reduce((acc: EmbedFieldData[], key: string) => {
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
  formatSourceListToEmbedField,
  isSourceListEmpty,
};
