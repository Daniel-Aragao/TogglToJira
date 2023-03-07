// -u user and password => create and save token

import { interpretArgument } from "./args/arguments-reader.js";
import { Main } from "./runner.js";
import { readConfig } from "./services/config-reader.js";
import { JiraService } from "./services/jira.service.js";
import { exceptionLog } from "./services/log-entries.js";
import { minimumFields, TogglService } from "./services/toggl.service.js";

const credentials = readConfig('credentials.json');
const defaultConfig = readConfig();

let services = {
    Toggl: new TogglService(defaultConfig, credentials),
    Jira: new JiraService(defaultConfig, credentials),
    Credentials: credentials,
    Arguments: {
        interval: {From: '', To: ''}, 
        preview: {
            isActive: true,
            fields: JSON.parse(JSON.stringify(minimumFields)),
        },
        preventMerge: false,
        fullMerge: false
    }
}

let promises = [];
process.argv.forEach((val, index) => {
    if(index > 1){
        promises.push(interpretArgument(val, services));
    }
});

Promise.all(promises).then(async () => {
    services.Toggl.validService();
    services.Jira.validService();
    await Main(services);
}).catch(e => {
    e.cause ? console.error(e.cause) : console.error(e);

    exceptionLog(e);
});
