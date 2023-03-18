import { cleanColors } from "../constants.js";

export const Log = cleanFormat => (str) => {
    if(cleanFormat){
        str = cleanColors(str)
    }
    console.log(str);
}