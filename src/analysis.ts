/**
  * First task - Read the csv files in the inputPath and analyse them
 *
  * @param {string[]} inputPaths An array of csv files to read
  * @param {string} outputPath The path to output the analysis
 */

import * as fs from 'fs';
import EmailValidator from 'email-validator';

interface Results {
  'valid-domains': string[];
  totalEmailsParsed: number;
  totalValidEmails: number;
  categories: Record<string, number>;
}

async function analyseFiles(inputPaths: string[], outputPath: string) {
  try {

    const readPromises = inputPaths.map(async (filePath) => {
      try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data.split('\n').slice(1, -1);
      } catch (readErr) {
        throw Error(`Error reading file: ${filePath}`);
      }
    });

    const emailArrays = await Promise.all(readPromises);

    let trueEmailArr: string[] = [];
    let validEmailArr: string[] = [];
    let validDomainsArr: string[] = [];
    let domainNamesFreq: Record<string, number> = {};

    emailArrays.forEach((emailArr) => {
      trueEmailArr = [...trueEmailArr, ...emailArr];

      for (const email of emailArr) {
        if (EmailValidator.validate(email)) {
          validEmailArr.push(email);
          const splitValid = email.split('@');
          validDomainsArr.push(splitValid[1]);
        }
      }
    });

    validDomainsArr.forEach((z) => {
      if (domainNamesFreq[z]) {
        domainNamesFreq[z]++;
      } else {
        domainNamesFreq[z] = 1;
      }
    });

    const uniqueValidDomainsArr = Array.from(new Set<string>(validDomainsArr));

    const result: Results = {
      'valid-domains': uniqueValidDomainsArr,
      totalEmailsParsed: trueEmailArr.length,
      totalValidEmails: validEmailArr.length,
      categories: domainNamesFreq,
    };


    await fs.promises.writeFile(outputPath, JSON.stringify(result), 'utf-8');
  } catch (err) {
    throw err;
  }
}

export default analyseFiles;