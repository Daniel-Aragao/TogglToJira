import fs from "fs";
import path from "path";
import { cleanColors } from "../constants.js";
import { __dirname } from "../utils.js";

const getFileName = (dir, file) => path.join(dir, `${file}.json`);

const getDir = (dir) => path.join(__dirname, dir);

const getSuccessDir = (from) => getDir(`logs/success/${from}`);
const getFailDir = (from) => getDir(`logs/fail/${from}`);

export async function logEntry(jiraLog, from) {
  let getDirFunc = jiraLog.uploadedOnJira ? getSuccessDir : getFailDir;

  return new Promise((resolve, reject) => {
    let dir = getDirFunc(from.substring(0, 10));
    let existsDir = fs.existsSync(dir);

    if (!existsDir) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data = JSON.stringify(jiraLog, null, 4);

    fs.appendFile(
      getFileName(dir, jiraLog.id),
      data ?? "Fail to parse log",
      (err) => {
        err ? reject(err) : resolve();
      }
    );
  });
}

export async function logEntries(jiraLogs, from) {
  await Promise.allSettled(
    jiraLogs.map((log) => logEntry(log, from ?? "default"))
  ).then((results) => {
    let errors = [];
    results.map((result) => {
      if (result.status === "rejected") {
        errors.push(result.reason);
      }
    });

    if (errors.length > 0) {
      throw new Error("Error saving log", { cause: errors });
    }
  });
}

export function exceptionLog(exception) {
  try {
    let dir = getFailDir("");

    let existsDir = fs.existsSync(dir);

    if (!existsDir) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data = `============== ${new Date().toISOString()} ==============\n`;
    data += exception.stack;
    if(exception.cause){
      data += "\n" + exception.cause.stack + "\n";
    }
    data += `\n====================================================== \n\n`;

    fs.appendFileSync(
      path.join(dir, "Exceptions.txt"),
      cleanColors(data) ?? "Fail to parse log"
    );
  } catch(e) {
    console.error(e);
  }
}
