import { Command } from 'commander';
import { initializeDatabase } from './config/database';
import { SchedulerService } from './services/SchedulerService';
import { AVAILABLE_TASKS, getTask, getAllTasks, getAvailableTaskNames } from './tasks';
import { logger } from './utils/logger';
import 'reflect-metadata';

const program = new Command();

program
  .name('node-app-template')
  .description('TypeScript NodeJS application template with task scheduling')
  .version('1.0.0');

// Create tables command
program
  .command('create-tables')
  .description('Initialize database schema and create tables')
  .action(async () => {
    try {
      logger.info('Initializing database and creating tables...');
      await initializeDatabase();
      logger.info('Database initialization completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Failed to create tables:', error);
      process.exit(1);
    }
  });

// Development command - starts all tasks
program
  .command('dev')
  .description('Start all available tasks for development')
  .action(async () => {
    try {
      logger.info('Starting development mode with all tasks...');
      await initializeDatabase();
      
      const scheduler = new SchedulerService();
      
      // Schedule all available tasks
      scheduler.scheduleTasksFromRegistry(AVAILABLE_TASKS);
      
      logger.info('Starting scheduler with all tasks...');
      scheduler.start();
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        logger.info('Received SIGINT, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        logger.info('Received SIGTERM, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      logger.info('Development mode is running. Press Ctrl+C to stop.');
      
      // Log status every 5 minutes in dev mode
      setInterval(() => {
        const status = scheduler.getStatus();
        logger.info('Scheduler status:', status);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      logger.error('Failed to start development mode:', error);
      process.exit(1);
    }
  });

// Production start command - starts specific task
program
  .command('start <taskName>')
  .description('Start a specific task by name')
  .action(async (taskName: string) => {
    try {
      logger.info(`Starting production mode with task: ${taskName}`);
      await initializeDatabase();
      
      // Get the specified task
      const taskDefinition = getTask(taskName);
      if (!taskDefinition) {
        logger.error(`Task not found: ${taskName}`);
        logger.info('Available tasks:', getAvailableTaskNames());
        process.exit(1);
      }
      
      const scheduler = new SchedulerService();
      
      // Schedule only the specified task
      scheduler.scheduleTask(taskName, taskDefinition);
      
      logger.info(`Starting scheduler with task: ${taskName}...`);
      scheduler.start();
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        logger.info('Received SIGINT, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        logger.info('Received SIGTERM, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      logger.info(`Task ${taskName} is running. Press Ctrl+C to stop.`);
      
      // Log status every hour in production
      setInterval(() => {
        const status = scheduler.getStatus();
        logger.info('Scheduler status:', status);
      }, 60 * 60 * 1000);
      
    } catch (error) {
      logger.error('Failed to start production mode:', error);
      process.exit(1);
    }
  });

// List available tasks
program
  .command('list-tasks')
  .description('List all available tasks')
  .action(() => {
    try {
      logger.info('Available tasks:');
      
      const tasks = getAllTasks();
      tasks.forEach((task, index) => {
        logger.info(`${index + 1}. ${task.name}`);
        logger.info(`   Description: ${task.description}`);
        logger.info(`   Schedule: ${task.cronExpression}`);
        logger.info('');
      });
      
      process.exit(0);
    } catch (error) {
      logger.error('Failed to list tasks:', error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check application status and configuration')
  .action(async () => {
    try {
      logger.info('Checking application status...');
      
      // Check database connection
      try {
        await initializeDatabase();
        logger.info('✓ Database connection: OK');
      } catch (error) {
        logger.error('✗ Database connection: FAILED', error);
      }
      
      // Check environment variables
      const requiredEnvVars = [
        'DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        logger.info('✓ Environment variables: OK');
      } else {
        logger.error('✗ Missing environment variables:', missingVars);
      }
      
      // Show available tasks
      logger.info('Available tasks:', getAvailableTaskNames());
      
      process.exit(0);
    } catch (error) {
      logger.error('Status check failed:', error);
      process.exit(1);
    }
  });

// Test command for basic functionality
program
  .command('test')
  .description('Test database connection and basic functionality')
  .action(async () => {
    try {
      logger.info('Testing application...');
      
      // Test database connection
      await initializeDatabase();
      logger.info('✓ Database connection test: OK');
      
      // Test task registry
      const tasks = getAllTasks();
      logger.info(`✓ Task registry test: ${tasks.length} tasks available`);
      
      // Test scheduler service
      const scheduler = new SchedulerService();
      logger.info('✓ Scheduler service test: OK');
      
      logger.info('All tests passed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('✗ Test failed:', error);
      process.exit(1);
    }
  });

export { program };
