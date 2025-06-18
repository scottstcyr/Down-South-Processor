import { DSOrderProcessingService } from '../services/DSOrderProcessingService';
import { logger } from '../utils/logger';

/**
 * Task to process DS Order HTML files every minute
 */
export async function DSOrderProcessingTask(): Promise<void> {
    try {
        logger.info('Starting DS Order processing task');
        
        const orderProcessor = new DSOrderProcessingService();
        await orderProcessor.processOrderFiles();
        
        logger.info('DS Order processing task completed');
    } catch (error) {
        logger.error('Error in DS Order processing task:', error);
        throw error;
    }
}
