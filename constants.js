// Color
export const CONSOLE_COLOR_Reset = "\x1b[0m"
export const CONSOLE_COLOR_Bright = "\x1b[1m"
export const CONSOLE_COLOR_Dim = "\x1b[2m"
export const CONSOLE_COLOR_Underscore = "\x1b[4m"
export const CONSOLE_COLOR_Blink = "\x1b[5m"
export const CONSOLE_COLOR_Reverse = "\x1b[7m"
export const CONSOLE_COLOR_Hidden = "\x1b[8m"

// Foreground Color
export const CONSOLE_COLOR_FgBlack = "\x1b[30m"
export const CONSOLE_COLOR_FgRed = "\x1b[31m"
export const CONSOLE_COLOR_FgGreen = "\x1b[32m"
export const CONSOLE_COLOR_FgYellow = "\x1b[33m"
export const CONSOLE_COLOR_FgBlue = "\x1b[34m"
export const CONSOLE_COLOR_FgMagenta = "\x1b[35m"
export const CONSOLE_COLOR_FgCyan = "\x1b[36m"
export const CONSOLE_COLOR_FgWhite = "\x1b[37m"
export const CONSOLE_COLOR_FgGray = "\x1b[90m"

// Background Color
export const CONSOLE_COLOR_BgBlack = "\x1b[40m"
export const CONSOLE_COLOR_BgRed = "\x1b[41m"
export const CONSOLE_COLOR_BgGreen = "\x1b[42m"
export const CONSOLE_COLOR_BgYellow = "\x1b[43m"
export const CONSOLE_COLOR_BgBlue = "\x1b[44m"
export const CONSOLE_COLOR_BgMagenta = "\x1b[45m"
export const CONSOLE_COLOR_BgCyan = "\x1b[46m"
export const CONSOLE_COLOR_BgWhite = "\x1b[47m"
export const CONSOLE_COLOR_BgGray = "\x1b[100m"

export const paint = (color, text) => `${color}${text}${CONSOLE_COLOR_Reset}`
export const marker = paint(CONSOLE_COLOR_FgYellow, ':::');