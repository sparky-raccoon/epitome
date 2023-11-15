import { open, close, access, readFile, writeFile } from "fs";
import path from "path";
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

export { addSource, deleteSource, listSources };
