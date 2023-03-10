import { logEntries } from "./services/log-entries.js";
import {
  mapToJira,
  mergeEntries,
  toDuration,
  formatLogsDurationToHour,
  formatLogsDurationToSecond,
  formatJiraLogs,
  filterLogs,
} from "./utils.js";
import {
  paint,
  marker,
  CONSOLE_COLOR_FgGreen as Green,
  CONSOLE_COLOR_FgRed as Red,
  CONSOLE_COLOR_Underscore as Underscore,
} from "./constants.js";
import { Log } from "./services/logger.js";

export async function Main(services) {
  const log = Log(!services.Arguments.formatting)
  let timeLogs = [];
  let reportLogs = [];

  timeLogs = await getLogs(services);

  timeLogs = filterLogs(timeLogs, reportLogs);

  if (!services.Arguments.preventMerge) {
    timeLogs = mergeEntries(timeLogs, services.Arguments.fullMerge);
  }

  if (services.Arguments.preview.isActive) {
    log(
      `${marker} Period from ${paint(
        Green,
        services.Arguments.From
      )} to ${paint(Green, services.Arguments.To)} ${marker}`
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

    log(
      `${marker} Total worked hours ${paint(
        Green,
        toDuration(total)
      )} ${marker}`
    );
  } else if (timeLogs.length > 0) {
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
