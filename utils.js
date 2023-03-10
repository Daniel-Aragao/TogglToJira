import path from "path";
import { fileURLToPath } from "url";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Transform from Miliseconds to seconds */
export const toUnix = (date) => Math.floor(date.getTime() / 1000);

export const toDateFromISOtoGMT = (dateString) => {
  let date = new Date(dateString);
  if (dateString.indexOf("T") > 0) {
    return date;
  }
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};
export const toPartialISOString = (date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const toJiraDateFromToggl = (dateString) => {
  let splitedDateString = dateString.split("+");
  return (
    splitedDateString[0] + ".000+" + splitedDateString[1].split(":").join("")
  );
};

export const mapToJira = (timeLogs) => {
  return timeLogs.map((log) => {
    return {
      id: log.id,
      ticket: log.ticket,
      data: {
        timeSpentSeconds: log.duration,
        comment: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: log.description,
                  type: "text",
                },
              ],
            },
          ],
        },
        started: toJiraDateFromToggl(log.start),
      },
    };
  });
};

export const mergeEntries = (timeLogs, fullMerge = false) => {
  return timeLogs.reduce((previous, currentLog, i) => {
    let repeated = previous.find((log) => {
      const hasSameTicket = log.ticket === currentLog.ticket;
      const hasDescription =
        log.description.split(";").indexOf(currentLog.description) >= 0;

      return hasSameTicket && (fullMerge || hasDescription);
    });

    if (repeated) {
      repeated.duration += currentLog.duration;
      repeated.id += `_${currentLog.id}`;
      repeated.description += `; ${currentLog.description}`;
    } else {
      previous.push({ ...currentLog });
    }

    return previous;
  }, []);
};

export const formatToHour = (seconds) => {
  return (seconds / (60 * 60)).toFixed(2) + "h";
};

export const formatToSeconds = (seconds) => {
  return seconds + "s";
};

export const toDuration = (seconds) => {
  let hours = Math.floor(seconds / (60 * 60));
  let minutes = Math.floor((seconds % (60*60)) / 60);
  let remainingSeconds = (seconds % (60*60)) % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const formatLogsDurationToHour = (timeLogs) => {
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
  return {logs: result, total: total};
}

export const formatLogsDurationToSecond = (timeLogs) => {
  let total = 0;

  const result = timeLogs.map(log => {
    if(log.duration < 0) {
      log.duration = Math.floor((new Date() - new Date(log.start)) / 1000)
    }
    total += log.duration;

    return {
      ...log,
      id: formatDescription(log.id.toString()),
      description: formatDescription(log.description),
      duration: `${log.duration}s (${formatToHour(log.duration)})`
    }
  });

  result.push({description: "======================== TOTAL ========================", duration: `${formatToSeconds(total)}(${formatToHour(total)})`})
  return {logs: result, total: total};
}

export const formatJiraLogs = (jiraTimeLogs) => {
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

export const filterLogs = (timeLogs, reportLogs) =>
  timeLogs.filter((log) => {
    const hasTicket = !!log.ticket;
    const isInProgress = log.duration < 0;
    const hasMinimumDurations = log.duration >= 60;
    let isApproved = hasTicket && hasMinimumDurations;

    if (!isApproved) {
      log.currentStatus = [];
      !hasTicket && log.currentStatus.push('No ticket');
      isInProgress && log.currentStatus.push('In progress');
      !isInProgress && !hasMinimumDurations && log.currentStatus.push('Less than a minute');

      log.currentStatus = log.currentStatus.join(", ");

      reportLogs.push(log);
    }

    return isApproved;
  });