import { HelloTask } from './HelloTask';

/**
 * Task definition interface
 */
export interface TaskDefinition {
  name: string;
  description: string;
  cronExpression: string;
  taskFunction: () => Promise<void>;
}

/**
 * Registry of all available tasks
 * Add new tasks here to make them available to the scheduler
 */
export const AVAILABLE_TASKS: Record<string, TaskDefinition> = {
  "hello": {
    name: "Hello Task",
    description: "Logs 'Hi' every minute for testing",
    cronExpression: "* * * * *", // Every minute
    taskFunction: HelloTask
  }
  // TODO: Add more tasks as needed
  // "shopify-sync": {
  //   name: "Shopify Sync",
  //   description: "Sync payments from Shopify daily",
  //   cronExpression: "0 6 * * *", // 6 AM daily
  //   taskFunction: ShopifySyncTask
  // }
};

/**
 * Get all available task names
 */
export function getAvailableTaskNames(): string[] {
  return Object.keys(AVAILABLE_TASKS);
}

/**
 * Get task definition by name
 */
export function getTask(taskName: string): TaskDefinition | undefined {
  return AVAILABLE_TASKS[taskName];
}

/**
 * Get all task definitions
 */
export function getAllTasks(): TaskDefinition[] {
  return Object.values(AVAILABLE_TASKS);
}
