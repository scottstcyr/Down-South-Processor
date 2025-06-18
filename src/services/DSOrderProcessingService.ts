import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { DSOrder } from '../entities/DSOrder';
import { DSOrderDetail } from '../entities/DSOrderDetail';
import { DSOrderParser, ParsedOrderData } from './DSOrderParser';
import { logger } from '../utils/logger';

export class DSOrderProcessingService {
    private inputFolder: string;
    private processedFolder: string;
    private failedFolder: string;

    constructor() {
        this.inputFolder = process.env.DS_ORDER_INPUT_FOLDER || './input/unprocessed';
        this.processedFolder = process.env.DS_ORDER_PROCESSED_FOLDER || './input/processed';
        this.failedFolder = process.env.DS_ORDER_FAILED_FOLDER || './input/failed';
        
        // Ensure directories exist
        this.ensureDirectoriesExist();
    }

    /**
     * Process all order HTML files in the input directory
     */
    public async processOrderFiles(): Promise<void> {
        try {
            const files = fs.readdirSync(this.inputFolder);
            const orderFiles = files.filter(file => 
                file.toLowerCase().startsWith('order') && 
                file.toLowerCase().endsWith('.html')
            );

            if (orderFiles.length === 0) {
                logger.info('No order files found to process');
                return;
            }

            logger.info(`Found ${orderFiles.length} order file(s) to process`);

            for (const filename of orderFiles) {
                await this.processSingleFile(filename);
            }
        } catch (error) {
            logger.error('Error processing order files:', error);
        }
    }

    /**
     * Process a single order file
     */
    private async processSingleFile(filename: string): Promise<void> {
        const filePath = path.join(this.inputFolder, filename);
        let parsedData: ParsedOrderData | null = null;

        try {
            logger.info(`Processing file: ${filename}`);

            // Parse the HTML file
            parsedData = await DSOrderParser.parseOrderFile(filePath);

            // Validate parsed data
            if (!parsedData.order.OrderNumber) {
                throw new Error('Could not extract order number from file');
            }

            // Save to database
            await this.saveOrderToDatabase(parsedData);

            // Output CSV to console
            this.outputCSV(parsedData);

            // Move file to processed folder
            await this.moveFileToProcessed(filePath, filename);

            logger.info(`Successfully processed order ${parsedData.order.OrderNumber}`);

        } catch (error) {
            logger.error(`Failed to process file ${filename}:`, error);
            
            // Move file to failed folder
            await this.moveFileToFailed(filePath, filename);
        }
    }

    /**
     * Save order and details to database
     */
    private async saveOrderToDatabase(parsedData: ParsedOrderData): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const orderRepository = queryRunner.manager.getRepository(DSOrder);
            const detailRepository = queryRunner.manager.getRepository(DSOrderDetail);

            // Check if order already exists
            const existingOrder = await orderRepository.findOne({
                where: { OrderNumber: parsedData.order.OrderNumber }
            });

            if (existingOrder) {
                logger.info(`Order ${parsedData.order.OrderNumber} already exists, skipping database insert`);
                await queryRunner.rollbackTransaction();
                return;
            }

            // Save order
            await orderRepository.save(parsedData.order);

            // Save order details
            await detailRepository.save(parsedData.orderDetails);

            await queryRunner.commitTransaction();
            
            logger.info(`Saved order ${parsedData.order.OrderNumber} to database`);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Output flattened CSV to console
     */
    private outputCSV(parsedData: ParsedOrderData): void {
        try {
            const { order, orderDetails } = parsedData;

            // CSV Headers
            const headers = [
                'OrderNumber',
                'OrderDate',
                'ShipByDate',
                'FromCompany',
                'ShipToCompany',
                'ShipToName',
                'ShipToAddress',
                'ShipToCity',
                'ShipToState',
                'ShipToZip',
                'ShipToCountry',
                'ShipToPhone',
                'NumberOfLineItems',
                'ItemsCount',
                'SubtotalPrice',
                'SKU',
                'Item',
                'Quantity',
                'Price',
                'SuggestedPrice',
                'LineSubtotal'
            ];

            console.log('\n=== ORDER CSV OUTPUT ===');
            console.log(headers.join(','));

            // Output each order detail as a CSV row
            for (const detail of orderDetails) {
                const row = [
                    this.csvEscape(order.OrderNumber || ''),
                    this.csvEscape(order.OrderDate?.toISOString().split('T')[0] || ''),
                    this.csvEscape(order.ShipByDate?.toISOString().split('T')[0] || ''),
                    this.csvEscape(order.FromCompany || ''),
                    this.csvEscape(order.ShipToCompany || ''),
                    this.csvEscape(order.ShipToName || ''),
                    this.csvEscape(order.ShipToAddress || ''),
                    this.csvEscape(order.ShipToCity || ''),
                    this.csvEscape(order.ShipToState || ''),
                    this.csvEscape(order.ShipToZip || ''),
                    this.csvEscape(order.ShipToCountry || ''),
                    this.csvEscape(order.ShipToPhone || ''),
                    order.NumberOfLineItems.toString(),
                    order.ItemsCount.toString(),
                    order.SubtotalPrice.toFixed(4),
                    this.csvEscape(detail.SKU || ''),
                    this.csvEscape(detail.Item || ''),
                    detail.Quantity.toString(),
                    detail.Price.toFixed(4),
                    detail.SuggestedPrice.toFixed(4),
                    detail.Subtotal.toFixed(4)
                ];
                console.log(row.join(','));
            }
            console.log('=== END CSV OUTPUT ===\n');

        } catch (error) {
            logger.error('Error outputting CSV:', error);
        }
    }

    /**
     * Escape CSV field if it contains commas or quotes
     */
    private csvEscape(value: string): string {
        if (!value) return '';
        
        // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    /**
     * Move file to processed folder
     */
    private async moveFileToProcessed(currentPath: string, filename: string): Promise<void> {
        const newPath = path.join(this.processedFolder, filename);
        fs.renameSync(currentPath, newPath);
    }

    /**
     * Move file to failed folder
     */
    private async moveFileToFailed(currentPath: string, filename: string): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newFilename = `${timestamp}_${filename}`;
        const newPath = path.join(this.failedFolder, newFilename);
        fs.renameSync(currentPath, newPath);
    }

    /**
     * Ensure required directories exist
     */
    private ensureDirectoriesExist(): void {
        const directories = [this.inputFolder, this.processedFolder, this.failedFolder];
        
        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                logger.info(`Created directory: ${dir}`);
            }
        }
    }
}
