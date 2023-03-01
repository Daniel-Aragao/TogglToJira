import { logEntries } from "./services/log-entries.js";
import { mapToJira, mergeEntries, formatToHour, formatToSeconds } from "./utils.js";

export async function Main(services) {
  let timeLogs = [];
  let reportLogs = [];

  timeLogs = await getLogs(services);

  timeLogs = filterLogs(timeLogs, reportLogs);

  if(!services.Arguments.preventMerge) {
    timeLogs = mergeEntries(timeLogs, services.Arguments.fullMerge);
  }

  if (services.Arguments.preview.isActive) {
    console.log("==== Time logs to send ====");
    console.table(formatLogsDurationToHour(timeLogs));

    if (reportLogs.length > 0) {
      console.log("==== Filtered time logs ====");
      console.table(formatLogsDurationToSecond(reportLogs));
    }
  } else if (timeLogs.length > 0) {

    if(!services.Arguments.preventMerge) {
      timeLogs = mergeEntries(timeLogs, services.Arguments.fullMerge);
    }

    let jiraTimeLogs = mapToJira(timeLogs);

    await services.Jira.pushLogs(jiraTimeLogs);
    
    console.log("==== Time logs sent ====");
    await logEntries(jiraTimeLogs, services.Arguments.From);
    
    console.table(formatJiraLogs(jiraTimeLogs));
  }
}

const formatLogsDurationToHour = (timeLogs) => {
  let total = 0;

  const result = timeLogs.map(log => {
    total += log.duration;

    return {
      ...log,
      id: formatDescription(log.id.toString()),
      description: formatDescription(log.description),
      duration: formatToHour(log.duration)
    }
  });

  result.push({description: "======================== TOTAL ========================", duration: formatToHour(total)})
  return result;
}

const formatLogsDurationToSecond = (timeLogs) => {
  let total = 0;

  const result = timeLogs.map(log => {
    total += log.duration;

    return {
      ...log,
      id: formatDescription(log.id.toString()),
      description: formatDescription(log.description),
      duration: log.duration + 's'
    }
  });

  result.push({description: "======================== TOTAL ========================", duration: formatToSeconds(total)})
  return result;
}

const formatJiraLogs = (jiraTimeLogs) => {
  let total = 0;

  const result =  jiraTimeLogs.map(log => {
    total += log.data.timeSpentSeconds;

    return {
      id: formatDescription(log.id.toString()),
      ticket: log.ticket,
      description: formatDescription(log.data?.comment?.content?.[0]?.content?.[0]?.text),
      duration: formatToHour(log.data.timeSpentSeconds)
    }
  });

  result.push({description: "======================== TOTAL ========================", duration: formatToHour(total)})
  return result;
}

const formatDescription = (description) => {
  if(!description) return undefined;
  if(description.length > 55 ) {
    return description?.substring(0, 52) + "...";
  } else {
    return description?.substring(0, 55);
  }
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
