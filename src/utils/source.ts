import { open, close, readFile, writeFile } from "fs";
import * as path from "path";
import { Source, SourceList, SourceTrackingData } from "@/types";
import { SourceType } from "@/constants";

const DATA_FILE_PATH = path.resolve(__dirname, "../sources.json");

const writeFileAndClose = (fileHandler: number | undefined, data: SourceList): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), (writeError) => {
      const returnResult = () => {
        if (writeError) return reject(writeError);
        return resolve();
      };

      if (fileHandler) {
        close(fileHandler, () => {
          returnResult();
        });
      } else returnResult();
    });
  });
};

const findDuplicateSourceWithUrl = (sourceUrl: string): Promise<Source | null> => {
  return new Promise<Source | null>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) {
        if (openError.code === "ENOENT") return resolve(null);
        else return reject(openError);
      }

      readFile(DATA_FILE_PATH, "utf8", (readError, data) => {
        if (readError) return reject(readError);

        let duplicateSource: Source | null = null;
        const sourceList: SourceList = JSON.parse(data);
        const sourceTypes = Object.keys(sourceList);
        for (const sourceType of sourceTypes) {
          const sourceByTypes = sourceList[sourceType as SourceType];
          if (!sourceByTypes) continue;

          const sourceNames = Object.keys(sourceByTypes);
          for (const sourceName of sourceNames) {
            const sourceTrackingData = sourceByTypes[sourceName];
            if (sourceTrackingData.url === sourceUrl)
              duplicateSource = {
                type: sourceType as SourceType,
                name: sourceName,
                ...sourceTrackingData,
              };
          }
        }

        close(fileHandler, () => {
          return resolve(duplicateSource);
        });
      });
    });
  });
};

const addSource = (source: Source): Promise<void> => {
  const { type, name, ...otherSourceData } = source;
  const sourceTrackingData: SourceTrackingData = {
    ...otherSourceData,
    timestamp: Date.now().toString(),
  };

  return new Promise<void>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) {
        if (openError.code === "ENOENT") {
          writeFileAndClose(fileHandler, {
            [type]: { [name]: sourceTrackingData },
          })
            .then(() => {
              return resolve();
            })
            .catch((e) => {
              return reject(e);
            });
        } else return reject(openError);
      } else {
        readFile(DATA_FILE_PATH, "utf8", (readError, data) => {
          if (readError) return reject(readError);

          const sourceList = JSON.parse(data);
          writeFileAndClose(fileHandler, {
            ...sourceList,
            [type]: {
              ...sourceList[type],
              [name]: sourceTrackingData,
            },
          })
            .then(() => {
              return resolve();
            })
            .catch((e) => {
              return reject(e);
            });
        });
      }
    });
  });
};

const deleteSource = (sourceName: string, sourceType: SourceType): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) return reject(openError);

      readFile(DATA_FILE_PATH, "utf8", (readError, data) => {
        if (readError) return reject(readError);

        const parsedData = JSON.parse(data);
        if (Object.keys(parsedData[sourceType]).includes(sourceName)) {
          delete parsedData[sourceType][sourceName];
          if (Object.keys(parsedData[sourceType]).length === 0) delete parsedData[sourceType];
        } else return reject("Cette source de publications a déjà été supprimée.");

        writeFileAndClose(fileHandler, parsedData)
          .then(() => {
            return resolve();
          })
          .catch(() => {
            return reject();
          });
      });
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
        close(fileHandler, () => {
          if (readError) return reject(readError);
          return resolve(JSON.parse(data));
        });
      });
    });
  });
};

const replaceSourceList = (sourceList: SourceList): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) return reject(openError);

      writeFileAndClose(fileHandler, sourceList)
        .then(() => {
          return resolve();
        })
        .catch((e) => {
          return reject(e);
        });
    });
  });
};

export { addSource, deleteSource, listSources, findDuplicateSourceWithUrl, replaceSourceList };
