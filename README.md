# CLI tool to upload Toggl info into Jira
## Installing
1. To begin with run `npm i` in the root of the project.
1. Add the credentials
1. Your are good to go

## Credentials
The credentials file can be created in the first run, just include the credentials to Toggl and Jira
```
npm start -- toggl-user=email:password
```

The credentials might be run separately but be aware that the credentials.json file will be overridden for the respective credentials been setup. For example: if you run twice the toggl-user command the last information will prevail. If you change the properties manually, be aware not to run the toggl-user command again
> The email and password data are not been saved, but the user token

## Run
### From a date
```
npm start -- 2023-01-06
```
### From a date to another
```
npm start -- 2023-01-06:2023-01-17
```
### To preview only
```
npm start -- 2023-01-06:2023-01-17 -p
```
### To preview only selecting [fields](Toggl-fields)
```
npm start -- 2023-01-06:2023-01-17 preview=workspace_id,start,stop
```
> The fields `ticket`, `description`, `duration` and `at` will always be returned  

## Jira mapping
`ticket` is extract from the description using regex, this will be used to map the ticket on `Jira` 

To make the mapping work the user must respect the pattern on his time log:
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
| preview=field1,field2 | The same as -p, plus adding the wanted fields array comma separated |
| date1:date2 | To inform the date filter from date1 to date2. the ':' is not needed then date2 is not sent |

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
    "description": "LB-123 doing stuff",
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