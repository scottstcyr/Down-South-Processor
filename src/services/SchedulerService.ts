import * as cron from 'node-cron';
import { logger } from '../utils/logger';
import { TaskDefinition } from '../tasks';

export interface ScheduledTaskInfo {
  taskName: string;
  taskDefinition: TaskDefinition;
  cronTask: cron.ScheduledTask;
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export class SchedulerService {
  private scheduledTasks: Map<string, ScheduledTaskInfo> = new Map();
  private isStarted: boolean = false;

  constructor() {
    logger.info('SchedulerService initialized');
  }

  /**
   * Schedule a single task
   */
  scheduleTask(taskName: string, taskDefinition: TaskDefinition): void {
    if (this.scheduledTasks.has(taskName)) {
      logger.warn(`Task ${taskName} is already scheduled`);
      return;
    }

    // Validate cron expression
    if (!cron.validate(taskDefinition.cronExpression)) {
      throw new Error(`Invalid cron expression for task ${taskName}: ${taskDefinition.cronExpression}`);
    }

    logger.info(`Scheduling task: ${taskName}`, {
      description: taskDefinition.description,
      cronExpression: taskDefinition.cronExpression
    });

    // Create the cron task
    const cronTask = cron.schedule(taskDefinition.cronExpression, async () => {
      await this.executeTask(taskName, taskDefinition);
    }, {
      scheduled: false, // Don't start immediately
      timezone: process.env.TZ ?? 'America/Chicago'
    });

    // Store task info
    const taskInfo: ScheduledTaskInfo = {
      taskName,
      taskDefinition,
      cronTask,
      isRunning: false
    };

    this.scheduledTasks.set(taskName, taskInfo);
    logger.info(`Task ${taskName} scheduled successfully`);
  }

  /**
   * Schedule multiple tasks
   */
  scheduleTasks(tasks: TaskDefinition[]): void {
    tasks.forEach((task, index) => {
      const taskName = `task_${index}`; // Default name if not provided
      this.scheduleTask(taskName, task);
    });
  }

  /**
   * Schedule tasks from a registry with specific names
   */
  scheduleTasksFromRegistry(taskRegistry: Record<string, TaskDefinition>): void {
    Object.entries(taskRegistry).forEach(([taskName, taskDefinition]) => {
      this.scheduleTask(taskName, taskDefinition);
    });
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    if (this.isStarted) {
      logger.warn('SchedulerService is already started');
      return;
    }

    logger.info(`Starting SchedulerService with ${this.scheduledTasks.size} scheduled tasks`);

    this.scheduledTasks.forEach((taskInfo, taskName) => {
      taskInfo.cronTask.start();
      logger.info(`Started task: ${taskName}`);
    });

    this.isStarted = true;
    logger.info('SchedulerService started successfully');
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    if (!this.isStarted) {
      logger.warn('SchedulerService is not started');
      return;
    }

    logger.info('Stopping SchedulerService');

    this.scheduledTasks.forEach((taskInfo, taskName) => {
      taskInfo.cronTask.stop();
      logger.info(`Stopped task: ${taskName}`);
    });

    this.isStarted = false;
    logger.info('SchedulerService stopped successfully');
  }

  /**
   * Execute a task and handle errors
   */
  private async executeTask(taskName: string, taskDefinition: TaskDefinition): Promise<void> {
    const taskInfo = this.scheduledTasks.get(taskName);
    if (!taskInfo) {
      logger.error(`Task info not found for: ${taskName}`);
      return;
    }

    if (taskInfo.isRunning) {
      logger.warn(`Task ${taskName} is already running, skipping execution`);
      return;
    }

    try {
      taskInfo.isRunning = true;
      taskInfo.lastRun = new Date();
      
      logger.info(`Executing task: ${taskName}`);
      await taskDefinition.taskFunction();
      logger.info(`Task completed successfully: ${taskName}`);
    } catch (error) {
      logger.error(`Task failed: ${taskName}`, error);
    } finally {
      taskInfo.isRunning = false;
    }
  }

  /**
   * Get the status of all scheduled tasks
   */
  getStatus(): {
    isStarted: boolean;
    taskCount: number;
    tasks: Array<{
      name: string;
      description: string;
      cronExpression: string;
      isRunning: boolean;
      lastRun?: string | undefined;
    }>;
  } {
    const tasks = Array.from(this.scheduledTasks.entries()).map(([taskName, taskInfo]) => ({
      name: taskName,
      description: taskInfo.taskDefinition.description,
      cronExpression: taskInfo.taskDefinition.cronExpression,
      isRunning: taskInfo.isRunning,
      lastRun: taskInfo.lastRun ? taskInfo.lastRun.toISOString() : undefined
    }));

    return {
      isStarted: this.isStarted,
      taskCount: this.scheduledTasks.size,
      tasks
    };
  }

  /**
   * Get information about a specific task
   */
  getTaskInfo(taskName: string): ScheduledTaskInfo | undefined {
    return this.scheduledTasks.get(taskName);
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskName: string): boolean {
    const taskInfo = this.scheduledTasks.get(taskName);
    if (!taskInfo) {
      return false;
    }

    taskInfo.cronTask.stop();
    this.scheduledTasks.delete(taskName);
    logger.info(`Removed task: ${taskName}`);
    return true;
  }

  /**
   * Validate cron expression
   */
  static validateCronExpression(expression: string): boolean {
    return cron.validate(expression);
  }

  /**
   * Get all scheduled task names
   */
  getScheduledTaskNames(): string[] {
    return Array.from(this.scheduledTasks.keys());
  }
}
