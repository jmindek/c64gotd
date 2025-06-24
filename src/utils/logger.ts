// Simple logging utility for consistent logs
//@ts-nocheck


export class Logger {
  static info(...args: any[]) {
    console.info('[INFO]', ...args);
  }
  static warn(...args: any[]) {
    console.warn('[WARN]', ...args);
  }
  static error(...args: any[]) {
    console.error('[ERROR]', ...args);
  }
  static debug(...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
}
