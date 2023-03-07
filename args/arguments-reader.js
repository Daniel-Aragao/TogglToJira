import { toPartialISOString } from "../utils.js";
import { configToggl } from "./toggl-user.args.js";
import { configJira } from "./jira-user.args.js";

const dateRegex = /^(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?$/
const dateTimeRegex = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}Z$/

export async function interpretArgument(value, services) {
    if(value.startsWith('toggl-user')) {
        await configToggl(value, services.Toggl, services.Credentials);
        
    } else if(value.startsWith('jira-user')){
        configJira(value, services.Jira, services.Credentials);

    }else if(dateRegex.test(value)){
        let dates = dateRegex.exec(value);
        services.Arguments.From = dates[1];
        services.Arguments.To = dates[2];

    } else if(value.startsWith('from=')) {
        let from = value.split("=")[1];

        if(dateTimeRegex.test(from)) {
            services.Arguments.From = dateTimeRegex.exec(from)[0] 
        }
    } else if(value.startsWith('to=')) {
        let to = value.split("=")[1];

        if(dateTimeRegex.test(to)) {
            services.Arguments.To = dateTimeRegex.exec(to)[0] 
        }
    }else if(value.startsWith('push') || value === '-p') {
        services.Arguments.preview.isActive = false;
        // let fields = value.split("=");

        // if(fields.length > 1) {
        //     services.Arguments.preview.fields = fields[1].split(',');
        // }

    } else if(value === 'today') {
        let today = new Date();
        services.Arguments.From = toPartialISOString(today);
        
        today.setDate(today.getDate() + 1);
        services.Arguments.To = toPartialISOString(today);
    } else if(value === 'yesterday') {
        let today = new Date();
        services.Arguments.To = toPartialISOString(today);
        
        today.setDate(today.getDate() - 1);
        services.Arguments.From = toPartialISOString(today);
    } else if(value === 'prevent-merge' || value === '-pm') {
        services.Arguments.preventMerge = true;
    } else if(value === 'full-merge' || value === '-fm') {
        services.Arguments.fullMerge = true;
    }
}