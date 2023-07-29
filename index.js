// -u user and password => create and save token

import { interpretArgument } from "./args/arguments-reader.js";
import { Main } from "./runner.js";
import { readConfig } from "./services/config-reader.js";
import { JiraService } from "./services/jira.service.js";
import { exceptionLog } from "./services/log-entries.js";
import { minimumFields, TogglService } from "./services/toggl.service.js";
import {
    paint, CONSOLE_COLOR_FgYellow
} from "./constants.js";
  
const credentials = readConfig('credentials.json');
const defaultConfig = readConfig();
const userDataConfig = readConfig('user-data.json', true);

let services = {
    Toggl: new TogglService(defaultConfig, credentials),
    Jira: new JiraService(defaultConfig, credentials),
    Credentials: credentials,
    UserData: userDataConfig.get(),
    Arguments: {
        interval: {From: '', To: ''}, 
        preview: {
            isActive: true,
            fields: JSON.parse(JSON.stringify(minimumFields)),
            groupByDay: false,
            week: undefined,
            showProgressBar: false
        },
        preventMerge: false,
        fullMerge: false,
        formatting: true,
        addingConfig: false
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
    
    if(!services.Arguments.From){
        if(!services.Arguments.addingConfig) {
            throw new Error(`Main => Argument '${paint(CONSOLE_COLOR_FgYellow, 'From')}' can't be undefined, check if ` +
            `the the value follows the intended pattern in the documentation section ` +
            `for '${paint(CONSOLE_COLOR_FgYellow, 'date1')}', '${paint(CONSOLE_COLOR_FgYellow, 'from=')}' dates or `+
            `'${paint(CONSOLE_COLOR_FgYellow, 'today')}', '${paint(CONSOLE_COLOR_FgYellow, 'yesterday')}' and `+
            `'${paint(CONSOLE_COLOR_FgYellow, 'week')}' shortcuts`);
        }
    } else {
        await Main(services);
    }

}).catch(e => {
    e.cause ? console.error(e.cause) : console.error(e);

    exceptionLog(e);
});
