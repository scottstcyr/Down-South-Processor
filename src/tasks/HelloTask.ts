import { log } from '../utils/logger';

/**
 * Simple hello task that logs "Hi" message
 * This demonstrates the basic task pattern for the scheduler
 */
export async function HelloTask(): Promise<void> {
  log.info("Hi");
}
