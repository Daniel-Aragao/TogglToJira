# CLI tool to upload Toggl info into Jira
This tool was created to be used with [Toggl](https://toggl.com/track) tracker by getting all the data from Toggl during an interval and sending it to Jira.
One option of use is that every day the tool is going to send the time logs automatically using a job software such as crontab

## Contents
1. [Installing](#installing)
    1. [Running outside project folder](#running-from-any-directory-for-now-its-limited)
1. [Credentials](#credentials)
    1. [Toggl credentials](#toggl-credentials)
    1. [Jira credentials](#jira-credentials)
1. [Run](#run)
1. [Jira Mapping](#jira-mapping)
1. [Arguments](#arguments)
1. [Warnings](#warnings)
1. [Toggl fields](#toggl-fields)

> Currently it depends on the time track recorded previously in a third party tool and is not checking for duplicates

## Installing
1. To begin with run `npm i` in the root of the project.
1. Add [Toggl](#toggl-credentials) and [Jira](#jira-credentials) credentials
1. Your are good to go

### Running from any directory for now its limited
Example:
```
node C:/Users/daniel.filho/Git/TogglToJira/index.js today
```
> The shell/bash scripts are going to be created in the future

## Credentials
The credentials file can be created in the first run, just include the credentials to Toggl and Jira

### Toggl credentials
```
node index.js toggl-user=email:password
```
> The email and password data are not persisted, but the generated user token
### Jira credentials
```
node index.js jira-user=email:api_token
```
>To get Jira api_token access the [Atlassian tutorial](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)

The credentials might be run separately but be aware that the credentials.json file will be overridden for the respective credentials been setup.  
Example: if you run twice the `toggl-user` command the last information will prevail. If you change the properties manually, be aware not to run the `toggl-user` command again


## Run
### From a date (Since the given date)
```
node index.js 2023-01-06
```

### From a date to another
```
node index.js 2023-01-06:2023-01-17
```
> If the dates are equal the results will be empty

### To preview only
```
node index.js 2023-01-06:2023-01-17 -p
```
> This will prevent the data to be sent to Jira

### To preview only selecting [fields](#toggl-fields)
```
node index.js 2023-01-06:2023-01-17 preview=workspace_id,start,stop
```
> The fields `ticket`, `description`, `duration` and `start` will always be returned  

## Jira mapping
The field `ticket` is extracted from the description using regex, this will be used to map the ticket on `Jira` 

To make the mapping work the user must respect the pattern on his time log tool:
```
<ticket(1-3 chars)>-<1-5 numbers>description?
```
Regex:
```
/(\w{1,3}-\d{1,5})\s*(.*)/
```
Examples
### With or without spacing
```
LB-550 adding a button
```
```
LB-550adding a button
```
### No need for description
```
LB-550
```
> The logs without `ticket` will not be mapped to Jira

## Arguments
| name | description |
|---|---|
| -p | Set preview only, don't access Jira |
| preview=field1,field2 | The same as -p, but allows to add the wanted fields comma separated |
| date1:date2 | To inform the date filter from date1 to date2. The ':' is not needed then date2 is not sent |
| today | Set date1 = today's date and date2 as tomorrow, returning only the logs from today |
| yesterday | Set date1 = yesterday's date and date2 as today, returning only the logs from yesterday |

## Warnings
1. The date is going to be converted to GMT so if you are not aware of your logs try to set preview mode with `-p`
1. The dates shall not be the same or the results are going to be empty
    - If you want a specific day try to use the date you want and the date + 1 day
1. The tool currently doesn't check for duplicates, be aware of your input
1. Jira only accepts logs with more than 60 seconds so anything lower than this is going to be discarded

## Toggl fields
```
{
    "id": number,
    "workspace_id": number,
    "project_id": number,
    "task_id": null,
    "billable": false,
    "start": "2023-01-17T18:11:38+00:00",
    "stop": null,
    "duration": number, //  if negative its running
    "description": "LB-123 doing fun stuff",
    "tags": null,
    "tag_ids": null,
    "duronly": true,
    "at": "2023-01-17T18:11:40+00:00",
    "server_deleted_at": null,
    "user_id": number,
    "uid": number,
    "wid": number,
    "pid": number
}
```