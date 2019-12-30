import time from "./time";
import { SEVERITY } from './serverity'

class Logger {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  write(serverity: SEVERITY, args: any[]) {
    const params = [];
    params.push(
      `%c${SEVERITY[serverity]} %c${time()}`,
      "color: green;",
      "color: #347deb;"
    );
    const output: any = params.concat(args);
    console.log.apply(console.log, output);
  }

  log(...args: any[]) {
    this.write(SEVERITY.DEFAULT, args);
  }

  debug(...args: any[]) {
    this.write(SEVERITY.DEBUG, args);
  }

  info(...args: any[]) {
    this.write(SEVERITY.INFO, args);
  }

  notice(...args: any[]) {
    this.write(SEVERITY.NOTICE, args);
  }

  warning(...args: any[]) {
    this.write(SEVERITY.WARNING, args);
  }

  error(...args: any[]) {
    this.write(SEVERITY.ERROR, args);
  }

  crit(...args: any[]) {
    this.write(SEVERITY.CRITICAL, args);
  }

  alter(...args: any[]) {
    this.write(SEVERITY.ALERT, args);
  }

  emerg(...args: any[]) {
    this.write(SEVERITY.EMERGENCY, args);
  }
}

export default new Logger("Gusher");
