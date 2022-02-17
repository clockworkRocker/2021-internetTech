import {
  promises as fsp,
  existsSync
} from 'fs';
import { join } from 'path';
import { __dirname } from './utils.js';

const dirPath = join(__dirname, 'data');
const dataFileName = join(dirPath, 'park-data.json');

const readData = async () => {
  if (!existsSync(dataFileName)) {
    if (!existsSync(dirPath))
      await fsp.mkdir(dirPath);


    const file = await fsp.open(dataFileName, 'w');
    await file.write('[]');
    await file.close();
  }
  const data = await fsp.readFile(dataFileName, {
    encoding: 'utf-8'
  });

  return JSON.parse(data);
};

const writeData = async (data) => {
  if (data === undefined) return;

  if (!existsSync(dirPath))
    await fsp.mkdir(dirPath);

  await fsp.writeFile(dataFileName, JSON.stringify(data), 'utf-8');
}

export { readData, writeData };