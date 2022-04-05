import { access, readFile, writeFile } from 'fs';
import path from 'path';
import { Source, SourceList} from './types';

const DATA_FILE_PATH = path.resolve(__dirname, '../sources.json');

const updateDataFile = (data: SourceList) => {
    writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), error => {
        if (error) {
            console.error(error);
            return;
        }

        console.log('Data file updated with', data);
    });
}

const addSource = (newData: Source) => {
    console.log('addSource', newData);
    const { type, name, url, timestamp } = newData
    access(DATA_FILE_PATH, (err) => {
        if (err) {
            writeFile(DATA_FILE_PATH, JSON.stringify({ [type]: { [name]: { url, timestamp }}}, null, 2), error => {
                if (error) {
                    console.error(error);
                    return;
                }
            });
        } else {
            readFile(DATA_FILE_PATH, 'utf8', (error, data) => {
                if (error) {
                    console.error(error);
                    return;
                }

                const parsedData = JSON.parse(data);
                const newData = {
                    ...parsedData,
                    [type]: {
                        ...parsedData.type,
                        [name]: { url, timestamp },
                    }
                }

                updateDataFile(newData);
            })
        }
    })
}

const deleteSource = (sourceName: string) => {
    console.log('deleteSource', sourceName);
    readFile(DATA_FILE_PATH, 'utf8', (error, data) => {
        if (error) {
            console.error(error);
            return;
        }

        const parsedData = JSON.parse(data);
        for (const sourceType in parsedData) {
            if (Object.keys(parsedData[sourceType]).includes(sourceName)) {
                delete parsedData[sourceType][sourceName];
                break;
            }
        }

       updateDataFile(parsedData);
    })
}

export { addSource, deleteSource }