import fs from 'fs';

const getFileName = (path, file) => (`${path}/${file}`).replace('//','/');

export function readConfig(file="default.json", path='./config') {
    const pathName = getFileName(path, file);
    let exists = false;
    
    let data = '';
    let dataObj = {};

    if(fs.existsSync(pathName)) {
        data = fs.readFileSync(getFileName(path, file), {encoding: 'utf8'});
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