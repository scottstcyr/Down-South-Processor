# DS Order Processing System

## Overview

The DS Order Processing System automatically extracts order information from HTML files received from Down South Designer Customs customers and processes them into a structured database format with CSV output.

## Features

- **Automated File Processing**: Monitors input folder every minute for new order HTML files
- **HTML Parsing**: Extracts order details from complex HTML email templates
- **Database Storage**: Saves orders to SQL Server using TypeORM entities
- **CSV Output**: Generates flattened CSV data to console for easy export
- **File Management**: Automatically moves processed files to organized folders
- **Error Handling**: Comprehensive logging and error management
- **Duplicate Prevention**: Prevents duplicate order processing

## System Architecture

### Database Tables

#### DSOrders Table
- **OrderNumber** (Primary Key): Unique order identifier (e.g., "UP5HQ3P2NK")
- **OrderDate**: Date the order was placed
- **ShipByDate**: Required shipping date
- **FromCompany**: Originating company name
- **ShipToCompany**: Customer company name
- **ShipToName**: Customer contact name
- **ShipToAddress**: Street address
- **ShipToCity**: City
- **ShipToState**: State/Province
- **ShipToZip**: Postal code
- **ShipToCountry**: Country
- **ShipToPhone**: Contact phone number
- **NumberOfLineItems**: Count of line items
- **ItemsCount**: Total quantity of all items
- **SubtotalPrice**: Order total amount

#### DSOrderDetails Table
- **Id** (Auto-increment): Primary key
- **OrderNumber** (Foreign Key): Links to DSOrders
- **SKU**: Product SKU (may be empty)
- **Item**: Product description
- **Quantity**: Quantity ordered
- **Price**: Wholesale price (WSP)
- **SuggestedPrice**: Suggested retail price (SRP)
- **Subtotal**: Line total

### File Processing Flow

1. **Input Monitoring**: System checks `./input/unprocessed` folder every minute
2. **File Detection**: Identifies files matching pattern `order*.html`
3. **HTML Parsing**: Extracts order data using DOM parsing
4. **Data Validation**: Validates required fields and data integrity
5. **Database Storage**: Saves order and details to SQL Server
6. **CSV Output**: Prints flattened CSV to console
7. **File Management**: Moves files to processed or failed folders
8. **Logging**: Records all operations and errors

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# DS Order Processing Configuration
DS_ORDER_INPUT_FOLDER=./input/unprocessed
DS_ORDER_PROCESSED_FOLDER=./input/processed
DS_ORDER_FAILED_FOLDER=./input/failed
```

### Database Setup

The system automatically creates the required database tables when TypeORM synchronization is enabled. Ensure your database connection is properly configured in the main `.env` file:

```env
DB_HOST=your-sql-server-host
DB_PORT=1433
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
DB_DATABASE=your-database-name
```

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create Directory Structure**:
   ```bash
   mkdir -p input/unprocessed input/processed input/failed
   ```

3. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Update database connection settings
   - Adjust folder paths if needed

4. **Start the Application**:
   ```bash
   npm run dev
   ```

5. **Enable the Task**:
   ```bash
   # Using the CLI
   npm run dev start ds-order-processing
   ```

## Usage

### Processing Order Files

1. **Place HTML Files**: Copy order HTML files to the `./input/unprocessed` folder
2. **File Naming**: Ensure files start with "order" and end with ".html" (e.g., `order_12345.html`)
3. **Automatic Processing**: Files are processed every minute automatically
4. **Monitor Logs**: Check console output for processing status

### CSV Output Format

The system outputs a flattened CSV with the following columns:

```csv
OrderNumber,OrderDate,ShipByDate,FromCompany,ShipToCompany,ShipToName,ShipToAddress,ShipToCity,ShipToState,ShipToZip,ShipToCountry,ShipToPhone,NumberOfLineItems,ItemsCount,SubtotalPrice,SKU,Item,Quantity,Price,SuggestedPrice,LineSubtotal
```

Each order detail line item is output as a separate CSV row with the order header information repeated.

### File Management

- **Successful Processing**: Files moved to `./input/processed/`
- **Failed Processing**: Files moved to `./input/failed/` with timestamp prefix
- **Duplicate Orders**: Files processed but database insert skipped

## HTML Structure Requirements

The system expects HTML files with the following structure:

### Order Header Information
- Order number in elements containing "Order #" or "#"
- Order date following "Order Date" label
- Ship date following "Ship Date" label
- "From" company information
- "Ship To" address block with structured contact information

### Order Items Table
- Table containing columns: SKU, Item, Qty, WSP, Subtotal
- WSP column may include SRP information in format "SRP $X.XX"
- Rows excluding headers and total rows

## Error Handling

### Common Issues

1. **Missing Order Number**: File cannot be processed without extractable order number
2. **Malformed HTML**: Invalid HTML structure prevents parsing
3. **Missing Required Fields**: Items without description, quantity, or price are skipped
4. **Database Connection**: Ensure SQL Server is accessible and credentials are correct
5. **File Permissions**: Ensure read/write access to input folders

### Troubleshooting

1. **Check Logs**: Monitor console output for detailed error messages
2. **Verify HTML Structure**: Manually inspect failed HTML files
3. **Database Connectivity**: Test database connection independently
4. **File Permissions**: Ensure proper folder permissions
5. **Dependencies**: Run `npm install` to ensure all packages are installed

## Monitoring & Maintenance

### Regular Tasks

1. **Monitor Failed Folder**: Review files that couldn't be processed
2. **Database Maintenance**: Regularly backup DSOrders and DSOrderDetails tables
3. **Log Review**: Check logs for processing patterns and errors
4. **Folder Cleanup**: Archive old processed files periodically

### Performance Considerations

- **Large Files**: System handles standard order HTML files efficiently
- **High Volume**: Processes multiple files per minute cycle
- **Database Load**: Uses transactions for data integrity
- **Memory Usage**: Minimal memory footprint for typical order volumes

## API Integration

The DS Order Processing system integrates with the existing application through:

- **SchedulerService**: Automated task execution
- **Database**: Shared TypeORM connection
- **Logging**: Unified logging system
- **Configuration**: Environment variable management

## Support & Development

### Extending the System

1. **Custom Parsing**: Modify `DSOrderParser.ts` for different HTML formats
2. **Additional Fields**: Update entity classes and add database columns
3. **Output Formats**: Enhance `DSOrderProcessingService.ts` for different export formats
4. **Integration**: Add webhooks or API endpoints for external systems

### Testing

1. **Unit Tests**: Test individual parsing functions
2. **Integration Tests**: Test complete file processing workflow
3. **Sample Data**: Use provided sample HTML files for testing
4. **Database Tests**: Verify entity relationships and constraints

For additional support or feature requests, refer to the main application documentation or contact the development team.
