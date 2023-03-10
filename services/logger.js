export const Log = cleanFormat => (str) => {
    str = str.replace(/\x1b\[\d{1,2}m/g, '')
    console.log(str);
}