import { Command } from 'commander';
import { initializeDatabase } from './config/database';
import { SchedulerService } from './services/SchedulerService';
import { AVAILABLE_TASKS, getTask, getAllTasks, getAvailableTaskNames } from './tasks';
import { log } from './utils/logger';
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
      log.info('Initializing database and creating tables...');
      await initializeDatabase();
      log.info('Database initialization completed successfully');
      process.exit(0);
    } catch (error) {
      log.error('Failed to create tables:', error);
      process.exit(1);
    }
  });

// Development command - starts all tasks
program
  .command('dev')
  .description('Start all available tasks for development')
  .action(async () => {
    try {
      log.info('Starting development mode with all tasks...');
      await initializeDatabase();
      
      const scheduler = new SchedulerService();
      
      // Schedule all available tasks
      scheduler.scheduleTasksFromRegistry(AVAILABLE_TASKS);
      
      log.info('Starting scheduler with all tasks...');
      scheduler.start();
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        log.info('Received SIGINT, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        log.info('Received SIGTERM, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      log.info('Development mode is running. Press Ctrl+C to stop.');
      
      // Log status every 5 minutes in dev mode
      setInterval(() => {
        const status = scheduler.getStatus();
        log.info('Scheduler status:', status);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      log.error('Failed to start development mode:', error);
      process.exit(1);
    }
  });

// Production start command - starts specific task
program
  .command('start <taskName>')
  .description('Start a specific task by name')
  .action(async (taskName: string) => {
    try {
      log.info(`Starting production mode with task: ${taskName}`);
      await initializeDatabase();
      
      // Get the specified task
      const taskDefinition = getTask(taskName);
      if (!taskDefinition) {
        log.error(`Task not found: ${taskName}`);
        log.info('Available tasks:', getAvailableTaskNames());
        process.exit(1);
      }
      
      const scheduler = new SchedulerService();
      
      // Schedule only the specified task
      scheduler.scheduleTask(taskName, taskDefinition);
      
      log.info(`Starting scheduler with task: ${taskName}...`);
      scheduler.start();
      
      // Graceful shutdown
      process.on('SIGINT', () => {
        log.info('Received SIGINT, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        log.info('Received SIGTERM, shutting down gracefully...');
        scheduler.stop();
        process.exit(0);
      });
      
      log.info(`Task ${taskName} is running. Press Ctrl+C to stop.`);
      
      // Log status every hour in production
      setInterval(() => {
        const status = scheduler.getStatus();
        log.info('Scheduler status:', status);
      }, 60 * 60 * 1000);
      
    } catch (error) {
      log.error('Failed to start production mode:', error);
      process.exit(1);
    }
  });

// List available tasks
program
  .command('list-tasks')
  .description('List all available tasks')
  .action(() => {
    try {
      log.info('Available tasks:');
      
      const tasks = getAllTasks();
      tasks.forEach((task, index) => {
        log.info(`${index + 1}. ${task.name}`);
        log.info(`   Description: ${task.description}`);
        log.info(`   Schedule: ${task.cronExpression}`);
        log.info('');
      });
      
      process.exit(0);
    } catch (error) {
      log.error('Failed to list tasks:', error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check application status and configuration')
  .action(async () => {
    try {
      log.info('Checking application status...');
      
      // Check database connection
      try {
        await initializeDatabase();
        log.info('✓ Database connection: OK');
      } catch (error) {
        log.error('✗ Database connection: FAILED', error);
      }
      
      // Check environment variables
      const requiredEnvVars = [
        'DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        log.info('✓ Environment variables: OK');
      } else {
        log.error('✗ Missing environment variables:', missingVars);
      }
      
      // Show available tasks
      log.info('Available tasks:', getAvailableTaskNames());
      
      process.exit(0);
    } catch (error) {
      log.error('Status check failed:', error);
      process.exit(1);
    }
  });

// Test command for basic functionality
program
  .command('test')
  .description('Test database connection and basic functionality')
  .action(async () => {
    try {
      log.info('Testing application...');
      
      // Test database connection
      await initializeDatabase();
      log.info('✓ Database connection test: OK');
      
      // Test task registry
      const tasks = getAllTasks();
      log.info(`✓ Task registry test: ${tasks.length} tasks available`);
      
      // Test scheduler service
      const scheduler = new SchedulerService();
      log.info('✓ Scheduler service test: OK');
      
      log.info('All tests passed successfully');
      process.exit(0);
    } catch (error) {
      log.error('✗ Test failed:', error);
      process.exit(1);
    }
  });

export { program };
