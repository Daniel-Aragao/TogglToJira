import path from 'path';
import { fileURLToPath } from 'url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const toUnix = (date) => Math.floor(date.getTime() / 1000)
export const toDateFromISOtoGMT = (dateString) => {
    let date = new Date(dateString);
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
}
export const toPartialISOString = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;