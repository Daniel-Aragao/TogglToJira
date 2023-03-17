# CLI tool to upload Toggl info into Jira
This tool was created to be used with [Toggl](https://toggl.com/track) tracker by getting all the data from Toggl during an interval and sending it to Jira.  
One option of use is that every day the tool is going to send the time logs automatically using a job software such as crontab

## Contents
1. [Prerequisite](#prerequisite)
1. [Installing](#installing)
1. [Running from other directories](#running-from-any-directory)
    1. [Bash](#bash)
    1. [PowerShell](#windows-powershell)
1. [Credentials](#credentials)
    1. [Toggl credentials](#toggl-credentials)
    1. [Jira credentials](#jira-credentials)
1. [Run](#run)
1. [Jira Mapping](#jira-mapping)
1. [Arguments](#arguments)
1. [Warnings](#warnings)
1. [Toggl fields](#toggl-fields)
1. [Automation](#automating)
    1. [Task Scheduler](#windows-task-scheduler)
 

## Prerequisite
1. NodeJS
1. Bash - Optional

## Installing
1. To begin with run `npm i` in the root of the project.
2. Set alias [up-time](#running-from-any-directory)
> If the alias is not set, you may call the application through it's root folder running `node <path-to-root-folder>/index.js` instead of using `up-time`
3. Add [Toggl](#toggl-credentials) and [Jira](#jira-credentials) credentials
4. You are good to go

## Running from any directory
If you want to call it directly:
```
node <path>/index.js today
```

### Bash
Add the following alias with the proper replacements to `~/.bashrc`, you may need to create the file if you never did on windows.
```
alias up-time='"<path>\TogglToJira\UpTimeLogs.sh" $@'
```

> The `~` stands for the home path for example on windows: `C:\Users\<user>`

### Windows PowerShell
Check if the `$PROFILE` file exist
```
Test-Path -Path $PROFILE
```

If not, create a profile by entering the following code in your powershell.
```
if (!(Test-Path -Path $PROFILE)) {
  New-Item -ItemType File -Path $PROFILE -Force
}
```
Now add the following to the `$PROFILE` file

```
Set-Alias up-time "<path>\<project-folder>\UpTimeLogs.ps1"
```
>To edit the file use the editor of your choice, a simple way would be: `notepad $PROFILE` or `code $PROFILE`

## Credentials
The credentials file can be created in the first run, just include the credentials to Toggl and Jira

### Toggl credentials
```
up-time toggl-user=email:password
```
> The email and password data are not persisted and are used only to get the generated user token from `Toggl`

### Jira credentials
```
up-time jira-user=email:api_token
```
> To get Jira api_token access the [Atlassian tutorial](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)

The credentials might be run separately but be aware that the `config/credentials.json` file will be overridden for the respective credentials been setup.  
Example: if you run twice the `toggl-user` command the last information will prevail. If you change the properties manually, be aware not to run the `toggl-user` command again


## Run
### From a specific date
Every log for the informed day
```
up-time 2023-01-06
```

### From a date to another
```
up-time 2023-01-06:2023-01-17
```
> The second day is exclusive, if the dates are equal the results will be empty

### To push to Jira
```
up-time 2023-01-06:2023-01-17 -p
```
> Before sending the argument `-p` is good practice to see what are you trying to push to Jira. Strongly recommended before uploading
<!-- 
### To preview only selecting [fields](#toggl-fields)
```
up-time 2023-01-06:2023-01-17 preview=workspace_id,start,stop
```
> The fields `id`, `ticket`, `description`, `duration` and `start` will always be returned   -->

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
### Examples
#### With or without spacing
```
LB-550 adding a button
```
```
LB-550adding a button
```
#### No need for description
```
LB-550
```
> The logs without `ticket` will not be mapped to Jira

## Arguments
| name | description |
|---|---|
| `-p` / `push` | Send data to Jira |
| date1`:`date2 | To inform the date filter from date1 to date2. The ':' is not needed when date2 is not sent |
| date1 | Set date1 as informed and date2 as one day after date1, so it will return every log from date1 only |
| `today` | Shortcut to set date1 = today's date and date2 as tomorrow, returning only the logs from today |
| `yesterday` | Shortcut to set date1 = yesterday's date and date2 as today, returning only the logs from yesterday |
| `week` | Shortcut to set date1 = this week's sunday date and date2 as next week's sunday, returning only the logs from this week |
| `from=`date | Set the start date respecting the time [RFC3339](https://www.rfc-editor.org/rfc/rfc3339#page-10) format (`2023-02-28T22:39:00Z`) for GMT (always including Z) |
| `to=`date | Set the end date respecting the time [RFC3339](https://www.rfc-editor.org/rfc/rfc3339#page-10) format for GMT (always including Z). Ignored in case `from=` is not informed |
| `-pm` / `prevent-merge` | Prevent that items with the same ticket and description are converted to the same log |
| `-fm` / `full-merge` | Force items with the same ticket been merged in the same log|

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
    "duration": number, //  if negative its running/active
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

## Automating
To make it run daily you might add it to your system job runner

> Before setting it up, try running in preview mode to be sure you are happy with what you see. Try `up-time yesterday`

### Windows Task Scheduler
1. Open task scheduler, this should be installed in every windows
1. Go into the top menu `Action` > `Create Basic Task...`  
![](misc/task-scheduler/1.%20create%20basic%20task.png)
1. Give it a easy to remember name, maybe `TogglToJira` is enough and hit `Next`
1. Set it to run `Daily`, hit `Next`, and follow the steps in the image  
    ![](misc/task-scheduler/3.%20Daily%20time.png)
    - Set `Start:` for your current date of tomorrow
    - Set time for `8:00:00 AM`, or what ever time you start working. 
        - Be sure to avoid to run it next to midnight so the task will not run in the wrong day (in case of delay)
    - You can fill the field `Recur every:` with `1` and hit `Next`
1. For `Action` set `Start a program` and hit `Next`
1. In `Program/scrip:` ou can write `powershell` and inside `Add arguments (optional):` you can set as bellow:
    ```
    -Command " & '<path-to-the-repo>\UpTimeLogs.ps1' yesterday"
    ```
1. Done, now you see something similar to this when selecting your new task and navigating to "Actions":  
![](misc/task-scheduler/2.%20Task%20created.png)
    