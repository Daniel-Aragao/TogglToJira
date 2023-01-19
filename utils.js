import path from "path";
import { fileURLToPath } from "url";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Transform from Miliseconds to seconds */
export const toUnix = (date) => Math.floor(date.getTime() / 1000);

export const toDateFromISOtoGMT = (dateString) => {
  let date = new Date(dateString);
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
