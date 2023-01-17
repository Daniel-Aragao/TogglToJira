// -u user and password => create and save token

import { interpretArgument } from "./args/arguments-reader.js";
import { Main } from "./runner.js";
import { readConfig } from "./services/config-reader.js";
import { TogglService } from "./services/toggl.service.js";

const credentials = readConfig('credentials.json');
const defaultConfig = readConfig();

let services = {
    Toggl: new TogglService(defaultConfig, credentials),
    Credentials: credentials,
    Arguments: {interval: {From: '', To: ''}}
}

let promises = [];
process.argv.forEach((val, index) => {
    if(index > 1){
        promises.push(interpretArgument(val, services));
    }
});

Promise.all(promises).then(async () => {
    services.Toggl.validService();
    await Main(services);
}).catch(e => {
    console.error(e);
    e.cause && console.error(e.cause);
});
