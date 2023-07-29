import { toPartialISOString, toDateFromISOtoGMT, getWeekNumber, getDateOfWeek } from "../utils.js";
import { configToggl } from "./toggl-user.args.js";
import { configJira } from "./jira-user.args.js";

const dateRegex = /^(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?$/
const dateTimeRegex = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}Z$/
const weekNumberRegex = /^week(?:=(\d{1,2}))?$/

export async function interpretArgument(value, services) {
    if(value.startsWith('toggl-user')) {
        await configToggl(value, services.Toggl, services.Credentials);
        services.Arguments.addingConfig = true;
    } else if(value.startsWith('jira-user')){
        configJira(value, services.Jira, services.Credentials);
        services.Arguments.addingConfig = true;

    }else if(dateRegex.test(value)){
        let dates = dateRegex.exec(value);
        services.Arguments.From = dates[1];
        services.Arguments.To = dates[2];

        if(!services.Arguments.To) {
            let fromDate = toDateFromISOtoGMT(dates[1]);
            services.Arguments.To = toPartialISOString(new Date(fromDate.setDate(fromDate.getDate() + 1)));
            services.Arguments.preview.showProgressBar = true;
        }

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

        services.Arguments.preview.showProgressBar = true;
    } else if(value === 'yesterday') {
        let today = new Date();
        services.Arguments.To = toPartialISOString(today);
        
        today.setDate(today.getDate() - 1);
        services.Arguments.From = toPartialISOString(today);
        services.Arguments.preview.showProgressBar = true;
    } else if(value === 'prevent-merge' || value === '-pm') {
        services.Arguments.preventMerge = true;
    } else if(value === 'full-merge' || value === '-fm') {
        services.Arguments.fullMerge = true;
    } else if(weekNumberRegex.test(value)) {
        let weekN = Number(weekNumberRegex.exec(value)[1]);

        let today = new Date();
        let sunday = new Date(today);
        let saturdayInclusive = new Date(today);
        
        if(weekN) {
            sunday = getDateOfWeek(weekN);
            saturdayInclusive = new Date(sunday);
            saturdayInclusive.setDate(saturdayInclusive.getDate() + 7 );

        } else {
            sunday.setDate(sunday.getDate() - sunday.getDay());
            saturdayInclusive.setDate(saturdayInclusive.getDate() + (7 - saturdayInclusive.getDay()));
        }

        services.Arguments.From = toPartialISOString(sunday);
        services.Arguments.To = toPartialISOString(saturdayInclusive);

        services.Arguments.preview.week = weekN || getWeekNumber(sunday);
        services.Arguments.preview.groupByDay = true;
        services.Arguments.preventMerge = true;
        services.Arguments.preview.showProgressBar = true;

    } else if(value === '-by-day'){
        services.Arguments.preview.groupByDay = true;

    } else if(value === 'clean-formatting' || value === '-c') {
        services.Arguments.formatting = false;
    }
}