import { DSOrderProcessingService } from '../services/DSOrderProcessingService';
import { log } from '../utils/logger';

/**
 * Task to process DS Order HTML files every minute
 */
export async function DSOrderProcessingTask(): Promise<void> {
    try {
        log.info('Starting DS Order processing task');
        
        const orderProcessor = new DSOrderProcessingService();
        await orderProcessor.processOrderFiles();
        
        log.info('DS Order processing task completed');
    } catch (error) {
        log.error('Error in DS Order processing task:', error);
        throw error;
    }
}
