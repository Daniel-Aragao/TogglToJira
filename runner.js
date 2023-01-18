import { mapToJira } from "./utils.js";

export async function Main(services) {
  let timeLogs = [];
  let reportLogs = [];

  timeLogs = await getLogs(services);

  timeLogs = filterLogs(timeLogs, reportLogs);

  if (services.Arguments.preview.isActive) {
    console.log("==== Time logs to send ====");
    console.table(timeLogs);

    if (reportLogs.length > 0) {
      console.log("==== Filtered time logs ====");
      console.table(reportLogs);
    }
  } else {
    let jiraTimeLogs = mapToJira(timeLogs);
    // services.Jira.pushLogs(mappedTimeLogs);
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
