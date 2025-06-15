import { ShopifyService } from '../services/ShopifyService';
import { PaymentService } from '../services/PaymentService';
import { log } from '../utils/logger';

/**
 * Syncs payments from Shopify for the previous day
 * This task is typically scheduled to run daily at 6 AM
 */
export async function ShopifySyncTask(): Promise<void> {
  try {
    log.info('Starting scheduled Shopify payment sync');
    
    const shopifyService = ShopifyService.fromEnvironment();
    const paymentService = new PaymentService();
    
    // Get yesterday's date range (default behavior)
    const dateRange = ShopifyService.getDefaultDateRange();
    
    log.info('Syncing payments for date range', {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    });

    const transactions = await shopifyService.fetchPaymentsByDateRange(dateRange);
    await paymentService.savePayments(transactions);
    
    log.info(`Shopify sync completed successfully: ${transactions.length} transactions processed`);
  } catch (error) {
    log.error('Shopify sync task failed:', error);
    throw error; // Re-throw to let scheduler handle the error
  }
}

/**
 * Test Shopify API connection and fetch sample data
 * This can be used as a health check or diagnostic task
 */
export async function ShopifyTestTask(): Promise<void> {
  try {
    log.info('Testing Shopify API connection');
    
    const shopifyService = ShopifyService.fromEnvironment();
    
    // Get yesterday's date range
    const dateRange = ShopifyService.getDefaultDateRange();
    const transactions = await shopifyService.fetchPaymentsByDateRange(dateRange);
    
    const sampleTransactions = transactions.slice(0, 5); // Limit to 5 for testing
    
    log.info(`✓ Shopify API test successful: Found ${transactions.length} transactions`, {
      totalFound: transactions.length,
      sampleSize: sampleTransactions.length,
      dateRange: {
        start: dateRange.startDate.toISOString(),
        end: dateRange.endDate.toISOString()
      }
    });
    
    if (sampleTransactions.length > 0) {
      log.info('Sample transaction data', {
        firstTransaction: {
          id: sampleTransactions[0]?.id,
          amount: sampleTransactions[0]?.amount?.amount,
          paymentMethod: sampleTransactions[0]?.paymentMethod,
          orderName: sampleTransactions[0]?.order?.name
        }
      });
    }
  } catch (error) {
    log.error('Shopify test task failed:', error);
    throw error;
  }
}
