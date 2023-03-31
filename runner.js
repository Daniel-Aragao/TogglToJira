import { logEntries } from "./services/log-entries.js";
import {
  mapToJira,
  mergeEntries,
  toDuration,
  formatLogsDurationToHour,
  formatLogsDurationToSecond,
  formatJiraLogs,
  filterLogs,
  groupByDay,
  formatToHour,
  getProgressBar,
  spacer
} from "./utils.js";
import {
  paint,
  marker,
  CONSOLE_COLOR_FgGreen as Green,
  CONSOLE_COLOR_FgRed as Red,
  CONSOLE_COLOR_Underscore as Underscore
} from "./constants.js";
import { Log } from "./services/logger.js";

export async function Main(services) {
  const log = Log(!services.Arguments.formatting)
  let timeLogs = [];

  timeLogs = await getLogs(services);

  // Preview
  if (services.Arguments.preview.isActive) {
    let total = 0;
    let periodExpectedHours = services.UserData.expectedHours;
    
    if(services.Arguments.preview.groupByDay) {
      let timeLogsByDay = groupByDay(timeLogs);

      if(services.Arguments.preview.week) {
        let head1 = `Week ${paint(Green, services.Arguments.preview.week)} `;
        
        log(`${marker}${spacer(head1, 46)}${marker}`)
      }
      
      let head = `From ${paint(Green, services.Arguments.From)} To ${paint(Green, services.Arguments.To)}`;

      log(`${marker}${spacer(head, 46)}${marker}`)

      timeLogsByDay.forEach(group => {
        let reportLogs = [];
        let timeLogsPerDay = filterLogs(group.timeLogs, reportLogs);

        total += previewSingleLine(group.day, timeLogsPerDay, reportLogs, log)
      });

      if(services.UserData.expectedPeriod === 'week' && timeLogsByDay.length == 1) {
        periodExpectedHours = periodExpectedHours / 5;
      }

    } else {
      let reportLogs = [];
    
      timeLogs = filterLogs(timeLogs, reportLogs);

      if (!services.Arguments.preventMerge) {
        timeLogs = mergeEntries(timeLogs, services.Arguments.fullMerge);
      }

      total = preview(services.Arguments.From, services.Arguments.To, timeLogs, reportLogs, log)
    }

    let progressStr = "";

    if(services.UserData.expectedHours && services.Arguments.preview.groupByDay && services.Arguments.preview.showProgressBar) {
      progressStr = "  " + getProgressBar(total, periodExpectedHours , 15, services.Arguments.formatting);
    }

    let foot = ` Total worked hours ${paint(Green, toDuration(total))}${progressStr}`;

    log(`${marker}${spacer(foot, 46, 'end')}${marker}`);
  } else {
    // Push
    timeLogs = filterLogs(timeLogs);

    if (timeLogs.length > 0) {
      services.Jira.validService();
  
      if (!services.Arguments.preventMerge) {
        timeLogs = mergeEntries(timeLogs, services.Arguments.fullMerge);
      }
  
      let jiraTimeLogs = mapToJira(timeLogs);
  
      // await services.Jira.pushLogs(jiraTimeLogs);
  
      const sent = jiraTimeLogs.filter((jiraLogs) => jiraLogs.uploadedOnJira);
      const notSent = jiraTimeLogs.filter((jiraLogs) => !jiraLogs.uploadedOnJira);
  
      log(`${marker} Time logs ${paint(Underscore, "sent")} ${marker}`);
      console.table(formatJiraLogs(sent));
      log(`${marker} Time logs ${paint(Red, "not")} sent ${marker}`);
      console.table(formatJiraLogs(notSent));
  
      await logEntries(jiraTimeLogs, services.Arguments.From);
    }
  }
}

function preview(from, to, timeLogs, reportLogs, log) {
  log(
    `${marker} Period from ${paint(
      Green,
      from
    )} to ${paint(Green, to)} ${marker}`
  );
  log(
    `${marker} Time logs ${paint(Underscore, "to send")} ${marker}`
  );

  let { logs, total } = formatLogsDurationToHour(timeLogs);

  console.table(logs);

  if (reportLogs.length > 0) {
    log(`${marker} Filtered time logs ${marker}`);

    let reported = formatLogsDurationToSecond(reportLogs);

    console.table(reported.logs);

    total += reported.total;
  }

  return total;
}

function previewSingleLine(from, timeLogs, reportLogs, log) {
  let { total, totalFormatted } = formatLogsDurationToHour(timeLogs);
  
  let text = `${marker} Date ${paint(
    Green,
    from
  )} ${marker} ${totalFormatted}`

  if (reportLogs.length > 0) {
    
    let reported = formatLogsDurationToSecond(reportLogs);

    total += reported.total;

    text += ` + ${formatToHour(reported.total)}`
  } else {
    text += ''.padStart(9, ' ');
  }

  log(`${text} = ${formatToHour(total)} ${marker}`);

  return total;
}

async function getLogs(services) {
  try {
    return await services.Toggl.getLogs(
      services.Arguments.From,
      services.Arguments.To,
      services.Arguments.preview.fields
    );
  } catch (e) {
    throw new Error(
      `Main => Fail to get time logs::${services.Arguments.From}:${services.Arguments.To}`,
      { cause: e }
    );
  }
}
