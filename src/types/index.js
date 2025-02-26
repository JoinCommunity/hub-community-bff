/* eslint-disable no-async-promise-executor */
import ramda from 'ramda';
import fs from 'fs';

const currentDir = './src/types';

const getTypesDef = async () => new Promise(async (resolve) => {
  const files = fs.readdirSync(currentDir);

  const filesToRead = ramda.filter(
    (item) => item.includes('.graphql'),
    files,
  );

  let sTypes = '';

  let readedFiles = 0;

  filesToRead.forEach((item) => {
    fs.readFile(`${currentDir}/${item}`, (err, data) => {
      sTypes += data.toString();
      readedFiles += 1;
      if (readedFiles === filesToRead.length) {
        return resolve(sTypes);
      }
      return false;
    });
  });
});

export default getTypesDef;
