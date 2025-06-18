import winston from 'winston';
import { AppDataSource } from '../config/database';
import { LogEntry } from '../entities/LogEntry';

export interface ILogEntry {
  id: number;
  level: string;
  message: string;
  timestamp: Date;
}

// Define log levels as const assertion
export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

// TTY State enumeration
enum TTYState {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable'
}

// Logger configuration interface
interface LoggerConfig {
  logLevel?: string;
  errorLogPath?: string;
  combinedLogPath?: string;
  enableDatabaseLogging?: boolean;
  enableConsoleLogging?: boolean;
}

// Logger class implementation
export class Logger {
  private readonly winston: winston.Logger;
  private readonly config: Required<LoggerConfig>;
  private readonly ttyState: TTYState;
  private isUsingEphemeralMode: boolean = false;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      logLevel: config.logLevel ?? 'info',
      errorLogPath: config.errorLogPath ?? 'error.log',
      combinedLogPath: config.combinedLogPath ?? 'combined.log',
      enableDatabaseLogging: config.enableDatabaseLogging ?? true,
      enableConsoleLogging: config.enableConsoleLogging ?? true,
    };

    this.ttyState = process.stdout.isTTY ? TTYState.AVAILABLE : TTYState.UNAVAILABLE;

    this.winston = winston.createLogger({
      levels,
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: this.createTransports(),
    });
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    if (this.config.enableConsoleLogging) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => 
              `${timestamp} ${level}: ${message}`
            )
          ),
        })
      );
    }

    // File transports
    transports.push(
      new winston.transports.File({ 
        filename: this.config.errorLogPath, 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: this.config.combinedLogPath 
      })
    );

    return transports;
  }

  private handleEphemeralMode(): void {
    if (this.isUsingEphemeralMode) {
      this.completeEphemeral(true);
      this.isUsingEphemeralMode = false;
    }
  }

  private formatMessageForDatabase(message: string, metadata?: any[]): string {
    if (metadata?.length && metadata.length > 0) {
      return JSON.stringify({ message, metadata });
    }
    return JSON.stringify({ message });
  }

  private async logToDatabase(level: string, message: string, metadata?: any[]): Promise<void> {
    if (!this.config.enableDatabaseLogging) {
      return;
    }

    if (AppDataSource?.isInitialized) {
      const logRepository = AppDataSource.getRepository(LogEntry);
      const logEntry = new LogEntry();
      logEntry.level = level;
      logEntry.message = this.formatMessageForDatabase(message, metadata);
      logEntry.timestamp = new Date();
      await logRepository.save(logEntry);
    }
  }

  // Ephemeral logging methods
  public ephemeral(message: string, ...metadata: any[]): void {
    if (this.ttyState === TTYState.UNAVAILABLE) {
      console.log(message);
      return;
    }
    
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    const metadataString = metadata.length > 0 ? ` ${JSON.stringify(metadata)}` : '';
    process.stdout.write(`${message}${metadataString}`);
    this.isUsingEphemeralMode = true;
  }

  public completeEphemeral(persist: boolean = false): void {
    if (this.ttyState === TTYState.UNAVAILABLE) {
      return;
    }
    
    if (persist) {
      process.stdout.write('\n');
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
    this.isUsingEphemeralMode = false;
  }

  // Backwards compatibility method
  public temp(message: string, ...metadata: any[]): void {
    this.ephemeral(message, ...metadata);
  }

  // Standard logging methods
  public async error(message: string, ...metadata: any[]): Promise<void> {
    this.handleEphemeralMode();
    this.winston.error(message, metadata);
    await this.logToDatabase('error', message, metadata.length > 0 ? metadata : undefined);
  }

  public async warn(message: string, ...metadata: any[]): Promise<void> {
    this.handleEphemeralMode();
    this.winston.warn(message, metadata);
    await this.logToDatabase('warn', message, metadata.length > 0 ? metadata : undefined);
  }

  public async info(message: string, ...metadata: any[]): Promise<void> {
    this.handleEphemeralMode();
    this.winston.info(message, metadata);
    await this.logToDatabase('info', message, metadata.length > 0 ? metadata : undefined);
  }

  public debug(message: string, metadata?: any[]): void {
    this.handleEphemeralMode();
    this.winston.debug(message, metadata);
    // Don't log debug messages to database
  }
}

// Export singleton instance
export const logger = new Logger();
