import { open, close, access, readFile, writeFile } from "fs";
import path from "path";
import { Source, SourceList } from "@/types";
import { SourceType } from "@/constants";

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
  const { type, name, url, feed } = source;
  return new Promise<void>((resolve, reject) => {
    access(DATA_FILE_PATH, (err) => {
      const timestamp = new Date().toISOString();
      // FIXME: there might be other kind of errors here than 'file not found'.
      if (err) {
        writeFile(
          DATA_FILE_PATH,
          JSON.stringify(
            { [type]: { [name]: { url, timestamp, feed } } },
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
              [name]: { url, timestamp, feed },
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

const deleteSource = (
  sourceName: string,
  sourceType: SourceType
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    open(DATA_FILE_PATH, "r", (openError, fileHandler) => {
      if (openError) return reject(openError);

      readFile(DATA_FILE_PATH, "utf8", (readError, data) => {
        close(fileHandler, () => {
          if (readError) return reject(readError);

          const parsedData = JSON.parse(data);
          if (Object.keys(parsedData[sourceType]).includes(sourceName)) {
            delete parsedData[sourceType][sourceName];
          } else {
            return reject("Cette source de publications a déjà été supprimée.");
          }

          return updateDataFile(parsedData)
            .then(() => resolve())
            .catch((e) => reject(e));
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

export { addSource, deleteSource, listSources };
