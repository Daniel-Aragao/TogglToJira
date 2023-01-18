import fs from 'fs';
import path from 'path'
import { __dirname } from '../utils.js';

const getFileName = (dir, file) => path.join(__dirname, dir, file);
// const getFileName = (dir, file) => (`${dir}/${file}`).replace('//','/');

export function readConfig(file="default.json", dir='config') {
    const pathName = getFileName(dir, file);
    let exists = false;
    
    let data = '';
    let dataObj = {};

    if(fs.existsSync(pathName)) {
        data = fs.readFileSync(getFileName(dir, file), {encoding: 'utf8'});
        exists = true
        dataObj = JSON.parse(data);
    }

    return {
        get:() => {
            if(exists) {
                return JSON.parse(JSON.stringify(dataObj));
            }

            return {};
        },

        set: (newObj) => {
            fs.writeFileSync(pathName, JSON.stringify(newObj, null, 4), {encoding: 'utf8'})
            dataObj = newObj;
            exists = true;
        },
        path: pathName
    }

}