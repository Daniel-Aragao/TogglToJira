import fs from "fs";
import path from "path";
import { __dirname } from "../utils.js";

const getFileName = (dir, file) => path.join(__dirname, dir, file);

const writeToFile = (pathName, obj) => {
  fs.writeFileSync(pathName, JSON.stringify(obj, null, 4), {
    encoding: "utf8",
  });
}

export function readConfig(file = "default.json", create = true, dir = "config") {
  const pathName = getFileName(dir, file);
  let exists = false;

  let data = "";
  let dataObj = {};

  if (fs.existsSync(pathName)) {
    data = fs.readFileSync(getFileName(dir, file), { encoding: "utf8" });
    exists = true;
    dataObj = JSON.parse(data);
  } else if(create){
    dataObj = {
      expectedHours: 37.5,
      expectedPeriod: "week"
    };

    exists = true;
    writeToFile(pathName, dataObj);
  }  

  return {
    get: () => {
      if (exists) {
        return JSON.parse(JSON.stringify(dataObj));
      }

      return {};
    },

    set: (newObj) => {
      writeToFile(pathName, newObj);
      dataObj = newObj;
      exists = true;
    },
    path: pathName,
  };
}
