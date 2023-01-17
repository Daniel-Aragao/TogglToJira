import { configToggl } from "./toggl-user.args.js";

const dateRegex = /(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?/

export async function interpretArgument(value, services) {
    if(value.startsWith('toggl-user')) {
        return await configToggl(value, services.Toggl, services.Credentials);
    } else if(dateRegex.test(value)){
        let dates = dateRegex.exec(value);
        services.Arguments.From = dates[1];
        services.Arguments.To = dates[2];
    }
}