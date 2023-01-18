import { toPartialISOString } from "../utils.js";
import { configToggl } from "./toggl-user.args.js";

const dateRegex = /(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?/

export async function interpretArgument(value, services) {
    if(value.startsWith('toggl-user')) {
        return await configToggl(value, services.Toggl, services.Credentials);
    } else if(dateRegex.test(value)){
        let dates = dateRegex.exec(value);
        services.Arguments.From = dates[1];
        services.Arguments.To = dates[2];
    } else if(value.startsWith('preview') || value === '-p') {
        services.Arguments.preview.isActive = true;
        let fields = value.split("=");
        if(fields.length > 1) {
            services.Arguments.preview.fields = fields[1].split(',');
        }
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
    }
}