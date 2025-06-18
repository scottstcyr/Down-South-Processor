# WP App Template

This is a TypeScript NodeJS application template that provides a robust foundation for building business applications. It includes database connectivity, API integrations, task scheduling, and a comprehensive CLI interface.

## 🚀 Template Features

- **TypeScript**: Latest version with strict typing
- **Database Integration**: TypeORM with MSSQL support
- **HTML Processing**: DS Order Processing system for automated data extraction
- **API Integration**: Shopify GraphQL API (easily replaceable)
- **Task Scheduling**: Built-in cron-based task scheduling
- **CLI Interface**: Commander.js with robust command structure
- **Logging**: Winston-based logging system
- **Vault System**: Configuration and state persistence
- **Testing**: Jest test framework setup
- **Code Quality**: ESLint and Prettier configuration

## 📁 Project Structure

```
/src
    /config     -- Configuration files (database, app settings)
    /consts     -- Constant definitions
    /entities   -- Database ORM entity types
    /services   -- Business logic services
    /tasks      -- Scheduled task definitions
    /types      -- TypeScript type definitions
    /utils      -- Helper methods and utilities
/test           -- Test cases (organized by feature)
/documentation  -- Documentation and sample data
/dist          -- Compiled distribution files
```

## 🛠 Tech Stack

- **TypeScript** - Latest version with strict typing
- **NodeJS** - Latest LTS version
- **TypeORM** - Database ORM for SQL connections
- **MSSQL** - Microsoft SQL Server 2022
- **Winston** - Structured logging
- **@shopify/admin-api-client** - Shopify GraphQL API (replaceable)
- **commander.js** - CLI framework
- **node-cron** - Task scheduling
- **Jest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js (latest LTS)
- TypeScript
- Microsoft SQL Server 2022
- API credentials (Shopify or your target API)

### Installation

1. **Clone/Download this template**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. **Build the project:**
   ```bash
   npm run build
   ```

### Configuration

Update the `.env` file with your specific settings:

```env
# Database Configuration
DB_HOST=your-sql-server
DB_PORT=1433
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database

# API Configuration (customize for your needs)
SHOPIFY_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
SHOPIFY_API_VERSION=2025-01

# DS Order Processing Configuration
DS_ORDER_INPUT_FOLDER=./input/unprocessed
DS_ORDER_PROCESSED_FOLDER=./input/processed
DS_ORDER_FAILED_FOLDER=./input/failed
```

### DS Order Processing

This template includes a complete DS Order Processing system for automatically extracting order information from HTML files:

```bash
# Create required directories
mkdir -p input/unprocessed input/processed input/failed

# Start the DS Order Processing task
npm run dev -- start ds-order-processing

# Place order*.html files in input/unprocessed/ for automatic processing
```

**Features:**
- Automatic HTML parsing and data extraction
- Database storage with relational tables (DSOrders/DSOrderDetails)
- Flattened CSV output to console
- File management (processed/failed folder organization)
- Duplicate prevention and error handling

See `/documentation/DSOrderProcessing.md` for detailed setup and usage instructions.

## 📚 Using This Template

### 1. Customize for Your Project

1. **Update package.json**: Change name, description, and keywords
2. **Modify README.md**: Update with your project-specific information
3. **Configure API Integration**: Replace Shopify integration with your target API
4. **Update Database Entities**: Modify entities to match your data model
5. **Customize Tasks**: Update scheduled tasks for your business logic

### 2. Database Setup

The template includes a robust database layer:

- **Entities**: Define your data models in `/src/entities/`
- **Migrations**: Use TypeORM migrations for schema changes
- **Vault System**: Built-in key-value configuration storage

```bash
# Create database tables
npm run dev -- create-tables

# Check system status
npm run dev -- status
```

### 3. API Integration

The template uses Shopify as an example. To replace with your API:

1. **Update dependencies** in `package.json`
2. **Modify `/src/services/`** to use your API client
3. **Update `/src/types/`** with your API response types
4. **Customize `/src/tasks/`** for your data processing needs

### 4. Task Scheduling

Add scheduled tasks in `/src/tasks/`:

```typescript
export class YourCustomTask extends BaseTask {
    public static taskName = 'your-custom-task';
    
    public async execute(): Promise<void> {
        // Your task logic here
    }
}
```

## 🏗 Architecture Features

### Vault System
Four-tier configuration lookup:
1. Command line arguments
2. Environment variables  
3. Local cache
4. Database vault table

### Database Best Practices
- Use `varchar()` not `nvarchar()` for strings
- Primary keys as `IDENTITY(1,1)`
- Support for both `null` and `undefined` values
- Foreign key relationships where applicable

### API Resilience
- Exponential backoff retry logic
- Pagination support for large datasets
- Rate limiting awareness

## 📋 Available Commands

```bash
# Development
npm run dev          # Run in development mode
npm run build        # Build for production
npm start           # Run production build

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Code Quality
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues

# Application Commands
npm run dev -- status  # Check system status
npm run dev -- test   # Test API connections
```

## 🧪 Testing

The template includes a comprehensive testing setup:

- **Jest** configuration
- **Test structure** matching source code organization
- **Setup files** for test environment
- **Example tests** for services and entities

## 📖 Additional Documentation

- **DEV-GUIDELINES.md**: Development standards and practices
- **QUICKSTART.md**: Quick setup and deployment guide
- **/documentation/**: Extended documentation and samples

## 🤝 Contributing

This template follows strict development guidelines:

- TypeScript strict mode enabled
- Comprehensive error handling
- Consistent code formatting
- Unit tests for all services
- Clear documentation standards

## 📄 License

ISC License - Feel free to use this template for your projects.

---

## 🔄 Replacing Shopify Integration

To customize this template for a different API:

1. **Remove Shopify dependencies**:
   ```bash
   npm uninstall @shopify/admin-api-client
   ```

2. **Install your API client**:
   ```bash
   npm install your-api-client
   ```

3. **Update service files**:
   - Replace `/src/services/ShopifyService.ts` 
   - Update `/src/types/ShopifyTypes.ts`
   - Modify `/src/tasks/ShopifyTasks.ts`

4. **Update environment variables** in `.env`

This template provides a solid foundation that can be adapted to virtually any business application needs.
