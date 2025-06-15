export class EphemeralLogger {
  private static _instance: EphemeralLogger;
  private readonly isTTY: boolean;

  /** Private so you can’t new up multiple loggers */
  private constructor() {
    this.isTTY = process.stdout.isTTY;
  }

  /** Get the one and only logger instance */
  public static get instance(): EphemeralLogger {
    if (!this._instance) {
      this._instance = new EphemeralLogger();
    }
    return this._instance;
  }

  /** Overwrite the console’s single status line with `message` */
  public update(message: string, obj?: object): void {
    if (!this.isTTY) {
      console.log(message);
      return;
    }
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(message + (obj === undefined ? '' : ` ${JSON.stringify(obj)}`));
  }

  /**
   * End the ephemeral status.
   * @param persist If true, leave the last message in place and emit a newline.
   *                If false, clear the line without leaving any trace.
   */
  public complete(persist = false): void {
    if (!this.isTTY) {
      return;
    }
    if (persist) {
      process.stdout.write("\n");
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
  }
}

export var ephemeralLogger : EphemeralLogger = EphemeralLogger.instance;

