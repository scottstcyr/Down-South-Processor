#!/usr/bin/env node

import { config } from 'dotenv';
import { program } from './cli';
import { logger } from './utils/logger';
import 'reflect-metadata';

// Load environment variables
config();

// Configure process-level error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments and execute
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error('Application error:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export default main;
