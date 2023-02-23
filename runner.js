import { logEntries } from "./services/log-entries.js";
import { mapToJira } from "./utils.js";

export async function Main(services) {
  let timeLogs = [];
  let reportLogs = [];

  timeLogs = await getLogs(services);

  timeLogs = filterLogs(timeLogs, reportLogs);

  if (services.Arguments.preview.isActive) {
    console.log("==== Time logs to send ====");
    console.table(formatLogsDurationToHour(timeLogs));

    if (reportLogs.length > 0) {
      console.log("==== Filtered time logs ====");
      console.table(formatLogsDurationToSecond(reportLogs));
    }
  } else if (timeLogs.length > 0) {
    let jiraTimeLogs = mapToJira(timeLogs);

    await services.Jira.pushLogs(jiraTimeLogs);
    
    console.log("==== Time logs sent ====");
    await logEntries(jiraTimeLogs, services.Arguments.From);
    
    console.table(formatJiraLogsDurationToHour(jiraTimeLogs));
  }
}

const formatLogsDurationToHour = (timeLogs) => {
  return timeLogs.map(log => {
    return {
      ...log,
      duration: (log.duration/(60*60)).toFixed(2) + 'h'
    }
  });
}

const formatLogsDurationToSecond = (timeLogs) => {
  return timeLogs.map(log => {
    return {
      ...log,
      duration: log.duration + 'h'
    }
  });
}

const formatJiraLogsDurationToHour = (timeLogs) => {
  return timeLogs.map(log => {
    return {
      ...log,
      duration: (log.data.timeSpentSeconds/(60*60)).toFixed(2) + 'h'
    }
  });
}

const filterLogs = (timeLogs, reportLogs) =>
  timeLogs.filter((log) => {
    let isApproved = !!log.ticket && log.duration >= 60;

    if (!isApproved) {
      reportLogs.push(log);
    }

    return isApproved;
  });

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
