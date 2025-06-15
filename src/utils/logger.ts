import winston from 'winston';
import { AppDataSource } from '../config/database';
import { LogEntry } from '../entities/LogEntry';
import { ephemeralLogger } from './ephemeralLogger';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create Winston logger
const logger = winston.createLogger({
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),
    // File transports
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    }),
  ],
});

// Function to log to database
const logToDatabase = async (level: string, message: string): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      const logRepository = AppDataSource.getRepository(LogEntry);
      const logEntry = new LogEntry();
      logEntry.level = level;
      logEntry.message = message;
      logEntry.timestamp = new Date();
      await logRepository.save(logEntry);
    }
  } catch (error) {
    console.error('Failed to log to database:', error);
  }
};

var usingEphemeralLogger: boolean = false;

// Custom logger that logs to both Winston and database
export const log = {
  error: (message: string, ...obj: any[]): void => {
    if (usingEphemeralLogger) {
      ephemeralLogger.complete(true);
      usingEphemeralLogger = false;
    }
    logger.error(message, obj);
    logToDatabase('error', JSON.stringify(message)).catch(err => 
      console.error('Failed to log error to database:', err)
    );
  },
  warn: (message: string, ...obj: any[]): void => {
    if (usingEphemeralLogger) {
      ephemeralLogger.complete(true);
      usingEphemeralLogger = false;
    }
    logger.warn(message, obj);
    logToDatabase('warn', message).catch(err => 
      console.error('Failed to log warning to database:', err)
    );
  },
  info: (message: string, ...obj: any[]): void => {
    if (usingEphemeralLogger) {
      ephemeralLogger.complete();
      usingEphemeralLogger = false;
    }
    logger.info(message, obj);
    logToDatabase('info', message).catch(err => 
      console.error('Failed to log info to database:', err)
    );
  },

  temp: (message: string, ...obj: any[]): void => {
    ephemeralLogger.update(message, obj);
    usingEphemeralLogger = true;
    // Don't log ephemeral messages to database
  },

  debug: (message: string, obj?: object): void => {
    if (usingEphemeralLogger) {
      ephemeralLogger.complete(true);
      usingEphemeralLogger = false;
    }
    logger.debug(message, obj);
    // Don't log debug messages to database
  },
};
