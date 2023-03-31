import path from "path";
import { fileURLToPath } from "url";
import {CONSOLE_COLOR_Reset, CONSOLE_COLOR_BgGreen, CONSOLE_COLOR_BgWhite, CONSOLE_COLOR_FgBlack} from './constants.js';

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
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate()).toString().padStart(2, '0')}`;

export const toJiraDateFromToggl = (dateString) => {
  let splitedDateString = dateString.split("+");
  return (
    splitedDateString[0] + ".000+" + splitedDateString[1].split(":").join("")
  );
};

export const isSameDayFromString = (d1, d2) => {
  return isSameDay(toDateFromISOtoGMT(d1), toDateFromISOtoGMT(d2));
}

export const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

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
      const hasSameDescription =
        log.description.split(";").indexOf(currentLog.description) >= 0;

      return hasSameTicket && (fullMerge || hasSameDescription) && isSameDayFromString(log.start, currentLog.start);
    });

    if (repeated) {
      repeated.duration += currentLog.duration;
      repeated.id += `_${currentLog.id}`;
      repeated.description += repeated.description ? `; ${currentLog.description}`:'';
    } else {
      previous.push({ ...currentLog });
    }

    return previous;
  }, []);
};

export const formatToHour = (seconds) => {
  return ((seconds / (60 * 60)).toFixed(2) + "h").padStart(6, '0');
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
      id: formatDescription(log.id.toString(), 10),
      description: formatDescription(log.description),
      duration: formatToHour(log.duration)
    }
  });

  let totalFormatted = formatToHour(total);

  result.push({description: "================== TOTAL =================", duration: totalFormatted})
  return {logs: result, total: total, totalFormatted: totalFormatted};
}

export const formatLogsDurationToSecond = (timeLogs) => {
  let total = 0;

  const result = timeLogs.map(log => {
    if(log.duration < 0) {
      log.duration = Math.floor((new Date() - new Date(log.start)) / 1000)
    }

    if(log.currentStatus.includes('In progress')) {
      total += log.duration;
    }

    // 600 seconds = 10 min
    let durationTxt = log.duration >= 600 ? `${log.duration}s` : `${formatToHour(log.duration)}`;

    return {
      ...log,
      id: formatDescription(log.id.toString(), 10),
      description: formatDescription(log.description),
      duration: durationTxt
    }
  });

  let totalFormatted = total >= 600 ? `${formatToSeconds(total)}`:`${formatToHour(total)}`;

  result.push({description: "================== TOTAL =================", duration: totalFormatted})
  return {logs: result, total: total, totalFormatted: totalFormatted};
}

export const formatJiraLogs = (jiraTimeLogs) => {
  let total = 0;

  const result =  jiraTimeLogs.map(log => {
    total += log.data.timeSpentSeconds;

    return {
      id: formatDescription(log.id.toString(), 10),
      ticket: log.ticket,
      description: formatDescription(log.data?.comment?.content?.[0]?.content?.[0]?.text),
      duration: formatToHour(log.data.timeSpentSeconds)
    }
  });

  result.push({description: "======================== TOTAL ========================", duration: formatToHour(total)})
  return result;
}

const formatDescription = (description, size = 30) => {
  if(!description) return undefined;
  if(description.length > size ) {
    return description?.substring(0, size - 3) + "...";
  } else {
    return description?.substring(0, size);
  }
}
/**
 * Receive the time logs array to be pushed in the report logs array
 * @param {timelog[]} timeLogs The time logs from Toggl to be filtered
 * @param {repotLogs[]} reportLogs Will save the filtered logs output
 * @returns 
 */
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

      reportLogs?.push(log);
    }

    return isApproved;
  });

export const groupByDay = (timeLogs) => {
  const timeLogsByDay = timeLogs.reduce((prev, current) => {
    const day = current.start.split('T')[0];
    
    if(!prev[day]) {
      prev[day] = [];
    }
    
    prev[day].push(current);

    return prev;
  }, {});

  let list = [];

  for(let day in timeLogsByDay) {
    list.push({day: day, timeLogs: timeLogsByDay[day], order: new Date(day).getTime() });
  }

  list.sort((itemA, itemB) => itemA.order - itemB.order);

  return list;
}

/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
export function getWeekNumber(date) {
  // Copy date so don't modify original
  // date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  date = new Date(date);
  // Set sunday
  date.setDate(date.getDate() - date.getDay());
  // Get first day of year
  var yearStart = new Date(date.getFullYear(), 0, 1);
  // Set sunday
  yearStart.setDate(yearStart.getDate() - yearStart.getDay());
  // Calculate full weeks
  var weekNo = Math.ceil((((date - yearStart) / 86400000)) / 7);
  // Return array of year and week number
  return weekNo;
}

/**
 * Get date by week number
 * @param {int} w Week number
 * @returns 
 */
export function getDateOfWeek(w) {
  var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

  return new Date(new Date().getFullYear(), 0, d);
}

export const cleanColors = (str) => str.replace(/\x1b\[\d{1,2}m/g, '');

export const spacer = (text, qtd, pos = 'center', char = ' ') => {
    let size = cleanColors(text).length;
    let toPad = (qtd - size);
    let begin =  parseInt(toPad / 2);
    let end = toPad - begin;
    
    if(pos == 'center') {
        return ''.padStart(begin, char) + text + ''.padEnd(end, char);
        
    } else if(pos == 'start') {
        return ''.padStart(toPad, char) + text;
        
    } else if(pos = 'end') {
        return text + ''.padEnd(toPad, char);

    }
}

const getProgressBarText = (totalHours, expected, barCharSize) => {
  let bar = '';

  if(barCharSize >= 5) {
    let signal = expected <= totalHours ? ' ' : '-';
    let hourStr = `${signal}${Math.abs(expected - totalHours).toFixed(1).padStart(4, 0)}`

    if(barCharSize >= 12) {
      let percentage = Math.floor(Math.min(totalHours / expected, 1) * 100).toString().padStart(3, ' ') + '%';

      hourStr = `${percentage} | ${hourStr}`;
    }

    bar += spacer(hourStr, barCharSize);
  }

  return bar;
}

export function getProgressBar(total, expected, barCharSize, format = true) {
  let totalHours = total / (60 * 60);

  let percentage = Math.min(totalHours / expected, 1);

  let inProgressSize = Math.floor(barCharSize * percentage);

  
  // Add colors
  if(format) {
    let bar = getProgressBarText(totalHours, expected, barCharSize);
    let barArray = bar.split("");
    barArray.splice(inProgressSize, 0, CONSOLE_COLOR_BgWhite);
    bar = barArray.join('');
  
    bar = CONSOLE_COLOR_BgGreen + CONSOLE_COLOR_FgBlack + bar;
  
    bar += CONSOLE_COLOR_Reset;
    
    return bar;
  } else if(barCharSize >= 12) {
    inProgressSize = Math.floor((barCharSize - 5) * percentage);
    let missingSize = (barCharSize - 5) - inProgressSize;
    let bar = getProgressBarText(totalHours, expected, 5);

    bar = bar.trim();
    bar = ''.padStart(missingSize, '.') + bar;
    bar = ''.padStart(inProgressSize, '#') + bar;
    // ###.......
    return bar;
  } else if(barCharSize >= 4) {
    return Math.floor(percentage * 100).toString().padStart(3, ' ') + '%';
  }

  return ""
}